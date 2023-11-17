import {
  Body,
  Controller,
  Post,
  Res,
  HttpException,
  HttpStatus,
  Get,
  Query,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ethers } from 'ethers';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('')
  async authenticate(
    @Body('walletAddress') walletAddress: string,
    @Body('message') message: string,
    @Body('signature') signature: string,
    @Res() response: Response,
  ): Promise<any> {
    try {
      const verifiedAddress = ethers.verifyMessage(message, signature);
      const verifiedMessage = await this.authService.grantAuth(
        walletAddress,
        message,
      );
      if (verifiedAddress === walletAddress && verifiedMessage) {
        response.cookie('foundnone-collect', message, {
          sameSite: 'none',
          secure: true,
          httpOnly: true,
          maxAge: 28800000,
        });

        return response.send({ success: true, message: 'Authenticated' });
      } else {
        throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
      }
    } catch (error) {
      throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('/prepare')
  async generateNonceForAddress(
    @Query('address') walletAddress: string,
  ): Promise<any> {
    const update =
      await this.authService.generateNonceForAddress(walletAddress);
    return { status: true, update };
  }

  @Get('/valid')
  async validSession(
    @Query('address') walletAddress: string,
    @Headers('cookie') cookie: string,
  ): Promise<any> {
    const res = await this.authService.verifyCookie(walletAddress, cookie);
    if (res !== true) throw new UnauthorizedException();
    return { status: true, res };
  }
}
