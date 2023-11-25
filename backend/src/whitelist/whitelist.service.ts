import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Whitelist } from './schema/whitelist.interface';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WhitelistService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    @InjectModel('Whitelist')
    private whitelistModel: Model<Whitelist>,
  ) {}

  // run this nestjs command with npm run command populate:whitelist 0xYourContract
  // to populate the whitelists collection
  // dont forget to set your env variables and install dependencies

  async populateWhitelist(contract: string): Promise<void> {
    const api_key = this.configService.getOrThrow('ALCHEMY_API_KEY');
    const url = `https://eth-mainnet.g.alchemy.com/nft/v3/${api_key}/getOwnersForContract?contractAddress=${contract}&withTokenBalances=false`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const newAddresses = response.data.owners;

      // Fetch the existing document
      const existingWhitelist = await this.whitelistModel.findOne({});
      const existingAddresses = existingWhitelist
        ? existingWhitelist.addresses
        : [];

      const mergedAddresses = [
        ...new Set([...existingAddresses, ...newAddresses]),
      ];

      await this.whitelistModel.updateOne(
        {},
        { active: true, addresses: mergedAddresses },
        { new: true, upsert: true },
      );

      const updatedWhitelist = await this.whitelistModel.findOne({});
      console.log(
        'Updated whitelist length:',
        updatedWhitelist.addresses.length,
      );
    } catch (error) {
      console.error('Error fetching from Alchemy:', error);
    }
  }
}
