import * as mongoose from 'mongoose';

export const AuthSchema = new mongoose.Schema({
  walletAddress: String,
  message: String,
  expiresAt: { type: Date, expires: '8h' },
});
