import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

interface Transfer {
  transactionHash: string;
  from: string;
  to: string;
  blockNumber: string;
  tokenId: string;
  value?: string;
  imageUrl?: string;
  name?: string;
}

@Injectable()
export class MonitorService {
  private subgraphUrl: string;
  private discordWebhookUrl: string;
  private block: number;

  constructor(
    private configService: ConfigService,
    private blockchainService: BlockchainService,
    private httpService: HttpService,
  ) {
    this.subgraphUrl = this.configService.getOrThrow('SUBGRAPH_URL');
    this.discordWebhookUrl = this.configService.getOrThrow(
      'DISCORD_WEBHOOK_URL',
    );
  }

  async onModuleInit() {
    this.block = await this.blockchainService.getBlockNumber();
    console.log(this.block);
  }

  @Interval(30000)
  async monitorTransfers() {
    if (this.configService.getOrThrow('ENV') !== 'prod') return;
    const query = `{
      transfers(where: {blockNumber_gte: ${this.block}}){
        transactionHash
        from
        to
        blockNumber
        tokenId
      }
    }`;
    const data = await this.querySubgraph(query);
    const transfers: Transfer[] = data?.transfers;

    if (transfers?.length > 0) {
      for (const transfer of transfers) {
        transfer.value = await this.blockchainService.getTxValue(
          transfer.transactionHash,
        );
        const metadataUrl = await this.blockchainService.getTokenUri(
          transfer.tokenId,
        );
        const metadata = await lastValueFrom(this.httpService.get(metadataUrl));
        const imageUrl: string = metadata.data.image;
        const image = imageUrl.replace(
          'ipfs://',
          'https://tofushop.mypinata.cloud/ipfs/',
        );
        transfer.name = metadata.data.name;
        transfer.imageUrl = image;
        console.log(image);
        await this.sendDiscordMessage(transfer);
        this.block = parseInt(transfer.blockNumber) + 1;
      }
    }
    console.log(this.block);
  }

  private async sendDiscordMessage(transfer: Transfer) {
    // Example logic to determine the message type
    let messageType = 'Transfer';
    let color = 16748288;
    if (transfer.from === '0x0000000000000000000000000000000000000000') {
      messageType = 'Mint';
      color = 11665663;
    }
    if (parseFloat(transfer.value) > 0) {
      messageType = 'Sale';
      color = 1048320;
    }

    console.log({ message: messageType, value: transfer.value });

    const embed = {
      title: `${
        messageType === 'Sale'
          ? `${transfer.value} ETH Sale!`
          : `${messageType}`
      }`,
      url: `https://arbiscan.io/tx/${transfer.transactionHash}`,
      description: `${transfer.name} Token ID: ${transfer.tokenId}`,
      color: color,
      fields: [
        {
          name: 'From',
          value: transfer.from,
          inline: true,
        },
        {
          name: 'To',
          value: transfer.to,
          inline: true,
        },
      ],
      image: {
        url: transfer.imageUrl,
      },
    };

    const content = {
      embeds: [embed],
    };

    try {
      await lastValueFrom(
        this.httpService.post(this.discordWebhookUrl, content),
      );
      console.log('Message sent to Discord successfully');
    } catch (error) {
      console.error('Failed to send message to Discord', error);
    }
  }

  private async querySubgraph(query: string) {
    const req = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    };
    const resp = await fetch(this.subgraphUrl, req);
    const json = await resp.json();
    return json.data;
  }
}
