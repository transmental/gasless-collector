import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import collectorAbi from 'src/abi/collectorAbi.json';
import axios from 'axios';
import FormData from 'form-data';
import { CollectibleService } from 'src/collectibles/collectible.service';

type ResolveFunction = (value: any) => void;
type RejectFunction = (reason?: any) => void;

interface QueueItem {
  toAddress: string;
  collectibleId: string;
  resolve: ResolveFunction;
  reject: RejectFunction;
}

@Injectable()
export class BlockchainService {
  private wallet: ethers.Wallet;
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private queue: QueueItem[] = [];
  private processing = false;

  constructor(
    private collectibleService: CollectibleService,
    private configService: ConfigService,
  ) {
    this.provider = new ethers.JsonRpcProvider(
      this.configService.get('GOERLI_RPC_ENDPOINT'),
    );
    this.wallet = new ethers.Wallet(
      this.configService.get('RELAYER_PRIVATE_KEY'),
      this.provider,
    );
    this.contract = new ethers.Contract(
      this.configService.get('GOERLI_CONTRACT_ADDRESS'),
      collectorAbi,
      this.wallet,
    );
  }

  private async pinToPinata(metadata: Buffer): Promise<string> {
    console.log('Is metadata a Buffer:', Buffer.isBuffer(metadata));

    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const data = new FormData();
    data.append('file', metadata, { filename: 'metadata.json' });

    const config = {
      headers: {
        ...data.getHeaders(),
        pinata_api_key: this.configService.get('PINATA_API_KEY'),
        pinata_secret_api_key: this.configService.get('PINATA_API_SECRET'),
      },
    };

    try {
      const response = await axios.post(url, data, config);
      return `https://ipfs.io/ipfs/${response.data.IpfsHash}`;
    } catch (error) {
      console.error('Error pinning to Pinata:', error);
      throw error;
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    console.log('INITIAL QUEUE', this.queue);

    this.processing = true;
    const { toAddress, collectibleId, resolve, reject } = this.queue.shift();

    try {
      const result = await this.mintNFTInternal(toAddress, collectibleId);
      console.log('CURRENTLY MINTING', this.queue);
      resolve(result);
    } catch (error) {
      console.log('ERROR IN QUEUE', this.queue);
      reject(error);
    } finally {
      console.log('FINISHED QUEUE', this.queue);
      this.processing = false;
      this.processQueue();
    }
  }

  async mintNFTInternal(
    toAddress: string,
    collectibleId: string,
  ): Promise<any> {
    try {
      const res = await this.collectibleService.canUserMint(
        toAddress,
        collectibleId,
      );
      if (res.status !== true) throw new Error(res.error);
      const minted = res.collectible.minted + 1;

      res.collectible.metadata.name += ` #${minted.toString()}/${res.collectible.supply.toString()}`;

      const metadataBuffer = Buffer.from(
        JSON.stringify(res.collectible.metadata),
      );

      const tokenURI = await this.pinToPinata(metadataBuffer);
      console.log(`toAddress: ${toAddress}, tokenURI: ${tokenURI}`);
      const tx = await this.contract.mint(toAddress, tokenURI);
      const receipt = await tx.wait();
      const tokenID = BigInt(receipt.logs[1].data);
      const collectible = await this.collectibleService.updateCollectible(
        collectibleId,
        toAddress,
      );
      console.log(
        `NEW COLLECTIBLE MINTED TO ${toAddress} WITH TOKENID ${tokenID}`,
      );
      return {
        status: true,
        txHash: tx.hash,
        to: toAddress,
        tokenID: tokenID.toString(),
        collectible,
      };
    } catch (error) {
      console.log(error);
      return { status: false, error: error.message };
    }
  }

  public async mintNFT(toAddress: string, collectibleId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ toAddress, collectibleId, resolve, reject });
      this.processQueue();
    });
  }
}
