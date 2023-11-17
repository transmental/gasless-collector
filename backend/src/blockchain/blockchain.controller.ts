import { Body, Controller, Headers, Post } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { MintNftDto } from './dto/mint.dto';
import { AuthService } from 'src/auth/auth.service';

@Controller('/collect')
export class BlockchainController {
  constructor(
    private readonly blockchainService: BlockchainService,
    private authService: AuthService,
  ) {}

  @Post('')
  async mintNFT(
    @Body() mintNftDto: MintNftDto,
    @Headers('cookie') cookie: string,
  ): Promise<any> {
    const isVerified = await this.authService.verifyCookie(
      mintNftDto.toAddress,
      cookie,
    );
    console.log('IS VERIFIED: ', isVerified);

    if (!isVerified) {
      return { status: false, message: 'Unauthorized' };
    }

    const txRes = await this.blockchainService.mintNFT(
      mintNftDto.toAddress,
      mintNftDto.collectibleId,
    );
    if (txRes.status !== true) {
      return { status: false, message: 'Failed to collect', txRes };
    }
    return { status: true, txRes };
  }
}
