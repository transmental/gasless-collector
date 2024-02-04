import { Module } from '@nestjs/common';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthSchema } from 'src/auth/schemas/auth.schema';
import { CollectibleSchema } from 'src/collectibles/schema/collectible.schema';
import { CollectibleService } from 'src/collectibles/collectible.service';
import { WhitelistSchema } from '../whitelist/schema/whitelist.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Auth', schema: AuthSchema },
      { name: 'Collectible', schema: CollectibleSchema },
      { name: 'Whitelist', schema: WhitelistSchema },
    ]),
  ],
  controllers: [BlockchainController],
  providers: [
    AuthService,
    BlockchainService,
    ConfigService,
    CollectibleService,
  ],
  exports: [BlockchainService],
})
export class BlockchainModule {}
