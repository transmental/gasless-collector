export interface Auth {
  walletAddress: string;
  message: string;
  expiresAt: { type: Date; expires: '8h' };
}
