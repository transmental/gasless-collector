import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Collectible } from './schema/collectible.interface';
import FormData from 'form-data';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CollectibleService {
  constructor(
    private configService: ConfigService,
    @InjectModel('Collectible') private collectibleModel: Model<Collectible>,
  ) {}
  async getCollectibles(): Promise<any> {
    const res = this.collectibleModel.find({}).sort({ _id: -1 });
    return res;
  }

  async canUserMint(address: string, collectibleId: string): Promise<any> {
    const id = new mongoose.Types.ObjectId(collectibleId);
    const collectible = await this.collectibleModel.findOne({ _id: id });
    try {
      if (!collectible) {
        throw new Error('Collectible not found.');
      }

      if (collectible.minted + 1 > collectible.supply) {
        throw new Error('Max supply already reached for this collectible.');
      }

      if (collectible.collectedBy.includes(address)) {
        throw new Error('You have already collected this item.');
      }
      return { status: true, collectible };
    } catch (error) {
      return { status: false, error };
    }
  }

  async pinToPinata(metadata: Buffer): Promise<string> {
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

  async updateCollectible(
    collectibleId: string,
    toAddress: string,
  ): Promise<any> {
    const id = new mongoose.Types.ObjectId(collectibleId);
    const res = await this.collectibleModel.findOneAndUpdate(
      { _id: id },
      {
        $push: { collectedBy: toAddress },
        $inc: { minted: 1 },
      },
      { new: true },
    );

    console.log('collectible doc res: ', res);

    if (!res) {
      throw new Error('No document found with the given ID.');
    }

    return res;
  }
}
