import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import collectorAbi from 'src/abi/collectorAbi.json';
import { CollectibleService } from 'src/collectibles/collectible.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Whitelist } from '../whitelist/schema/whitelist.interface';

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
    @InjectModel('Whitelist')
    private readonly whitelistModel: Model<Whitelist>,
  ) {
    if (this.configService.getOrThrow('ENV') === 'local' || 'dev') {
      this.provider = new ethers.JsonRpcProvider(
        this.configService.get('GOERLI_RPC_ENDPOINT'),
      );
      this.wallet = new ethers.Wallet(
        this.configService.get('GOERLI_RELAYER_PRIVATE_KEY'),
        this.provider,
      );
      this.contract = new ethers.Contract(
        this.configService.get('GOERLI_CONTRACT_ADDRESS'),
        collectorAbi,
        this.wallet,
      );
    } else {
      this.provider = new ethers.JsonRpcProvider(
        this.configService.get('ARB_RPC_ENDPOINT'),
      );
      this.wallet = new ethers.Wallet(
        this.configService.get('ARB_RELAYER_PRIVATE_KEY'),
        this.provider,
      );
      this.contract = new ethers.Contract(
        this.configService.get('ARB_CONTRACT_ADDRESS'),
        collectorAbi,
        this.wallet,
      );
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
      throw error;
    } finally {
      console.log('FINISHED QUEUE', this.queue);
      this.processing = false;
      this.processQueue();
    }
  }

  private async mintNFTInternal(
    toAddress: string,
    collectibleId: string,
  ): Promise<any> {
    try {
      const whitelist = await this.whitelistCheck(toAddress);
      if (whitelist.status !== true) throw new Error(whitelist.error);
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

      const tokenURI =
        await this.collectibleService.pinToPinata(metadataBuffer);
      console.log(`toAddress: ${toAddress}, tokenURI: ${tokenURI}`);
      const tx = await this.contract.mint(toAddress, tokenURI);
      const receipt = await tx.wait();
      console.log(receipt);
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
        receipt,
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

  checkArray(toAddress: string, addresses: string[]): boolean {
    for (const address of addresses) {
      if (address === toAddress) {
        console.log('IN WHITELIST');
        return true;
      }
    }
    console.log('NOT IN WHITELIST');
    return false;
  }

  private async whitelistCheck(toAddress: string): Promise<any> {
    try {
      const res = await this.whitelistModel.findOne({});
      if (!res.active) return { status: true };
      if (res.active && !this.checkArray(toAddress, res.addresses)) {
        throw new Error('User not whitelisted');
      } else {
        return { status: true };
      }
    } catch (error) {
      return { status: false, error };
    }
  }
}
