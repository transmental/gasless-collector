import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ethers } from 'ethers';

interface Message {
  name: string;
  from?: string;
  to?: string;
  tokenId?: string;
  value?: string;
  imageUrl?: string;
  maker?: string;
  currency?: string;
  transactionHash?: string;
  blockNumber?: string;
  openseaUrl?: string;
}

interface Listing {
  event_type: string;
  order_hash: string;
  order_type: string;
  chain: string;
  protocol_address: string;
  start_date: number;
  expiration_date: number;
  asset: {
    identifier: string;
    collection: string;
    contract: string;
    token_standard: string;
    name: string;
    description: string;
    image_url: string;
    metadata_url: string;
    opensea_url: string;
    updated_at: string;
    is_disabled: boolean;
    is_nsfw: boolean;
  };
  quantity: number;
  maker: string;
  taker: string;
  payment: {
    quantity: string;
    token_address: string;
    decimals: number;
    symbol: string;
  };
  criteria: any;
  event_timestamp: number;
  is_private_listing: boolean;
}

@Injectable()
export class MonitorService {
  private subgraphUrl: string;
  private discordWebhookUrl: string;
  private block: number;
  private timeStamp: number;

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
    this.timeStamp = Math.floor(Date.now() / 1000);
  }

  @Interval(10000)
  async monitorActivity() {
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
    const transfers: Message[] = data?.transfers;
    const listings = await this.queryOpenseaListings();
    console.log(listings);

    if (listings?.length > 0) {
      for (const listing of listings) {
        const message: Message = {
          name: listing.asset.name,
          maker: listing.maker,
          imageUrl: listing.asset.image_url,
          tokenId: listing.asset.identifier,
          value: listing.payment.quantity,
          currency: listing.payment.symbol,
          openseaUrl: listing.asset.opensea_url,
        };
        await this.sendDiscordMessage(message);
      }
    }

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

  private async sendDiscordMessage(message: Message) {
    let messageType = 'Transfer';
    let color = 16748288;
    if (message.from === '0x0000000000000000000000000000000000000000') {
      messageType = 'Mint';
      color = 11665663;
    }
    if (parseFloat(message.value) > 0) {
      messageType = 'Sale';
      color = 1048320;
    }
    if (message.maker) {
      messageType = 'Listing';
      color = 16711935;
    }

    console.log({ message: messageType, value: message.value });

    const embed =
      messageType === 'Listing'
        ? {
            title: `${message.name} Listed`,
            url: message.openseaUrl,
            description: `Token ID ${
              message.tokenId
            } Listed for ${ethers.formatEther(message.value)} ${
              message.currency
            }`,
            color: color,
            fields: [
              {
                name: 'Maker',
                value: message.maker,
                inline: true,
              },
            ],
            image: {
              url: message.imageUrl,
            },
          }
        : {
            title: `${
              messageType === 'Sale'
                ? `${message.value} ETH Sale!`
                : `${messageType}`
            }`,
            url: `https://arbiscan.io/tx/${message.transactionHash}`,
            description: `${message.name} Token ID: ${message.tokenId}`,
            color: color,
            fields: [
              {
                name: 'From',
                value: message.from,
                inline: true,
              },
              {
                name: 'To',
                value: message.to,
                inline: true,
              },
            ],
            image: {
              url: message.imageUrl,
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

  private async queryOpenseaListings(): Promise<Listing[]> {
    try {
      let listings: any[] = [];
      let nextPageToken: string;

      do {
        const response = await lastValueFrom(
          this.httpService.get(
            `https://api.opensea.io/api/v2/events/collection/tokyokageru?limit=1&after=${
              this.timeStamp
            }&event_type=listing${
              nextPageToken ? `&next=${nextPageToken}` : ''
            }`,
            {
              headers: {
                Accept: 'application/json',
                'X-API-KEY': this.configService.getOrThrow('OPENSEA_API_KEY'),
              },
            },
          ),
        );
        const data = response.data;
        listings = listings.concat(data.asset_events);
        nextPageToken = data.next;
      } while (nextPageToken);
      this.timeStamp = Math.floor(Date.now() / 1000);
      return listings;
    } catch (e) {
      console.error(e);
      throw e;
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
