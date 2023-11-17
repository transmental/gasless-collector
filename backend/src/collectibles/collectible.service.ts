import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Collectible } from './schema/collectible.interface';

@Injectable()
export class CollectibleService {
  constructor(
    @InjectModel('Collectible') private collectibleModel: Model<Collectible>,
  ) {}
  async getCollectibles(): Promise<any> {
    const res = this.collectibleModel.find({});
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
