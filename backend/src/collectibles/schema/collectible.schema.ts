import * as mongoose from 'mongoose';

export const CollectibleSchema = new mongoose.Schema({
  collectedBy: Array,
  supply: Number,
  minted: Number,
  metadata: Object,
});
