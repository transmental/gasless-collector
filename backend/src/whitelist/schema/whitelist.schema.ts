import * as mongoose from 'mongoose';

export const WhitelistSchema = new mongoose.Schema({
  active: Boolean,
  addresses: Array,
});
