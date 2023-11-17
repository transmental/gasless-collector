import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth } from './schemas/auth.interface';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(@InjectModel('Auth') private authModel: Model<Auth>) {}

  async generateNonceForAddress(walletAddress: string): Promise<any> {
    const message =
      `Foundnone Collector ${walletAddress} using nonce ` +
      randomBytes(32).toString('hex');

    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 8);

    const res = await this.authModel.updateOne(
      { walletAddress },
      { $set: { walletAddress, message, expiresAt: expiry } },
      { upsert: true },
    );

    return { status: true, message, res };
  }

  async grantAuth(walletAddress: string, message: string): Promise<boolean> {
    const auth = await this.authModel.findOne({ walletAddress }).exec();
    console.log('verify res:', auth.message, message, auth.message === message);
    return auth && auth.message === message;
  }

  async verifyCookie(walletAddress: string, cookie: string): Promise<boolean> {
    try {
      const auth = await this.authModel.findOne({ walletAddress }).exec();
      const extracted = await this.extractCookieValue(
        cookie,
        'foundnone-collect',
      );
      console.log(cookie);
      console.log(auth.message, extracted, auth.message === extracted);
      return auth && auth.message === extracted;
    } catch (error) {
      return false;
    }
  }

  async extractCookieValue(
    cookieHeader: string,
    cookieName: string,
  ): Promise<string> {
    const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
    const targetCookie = cookies.find((cookie) =>
      cookie.startsWith(`${cookieName}=`),
    );
    return targetCookie ? decodeURIComponent(targetCookie.split('=')[1]) : null;
  }
}
