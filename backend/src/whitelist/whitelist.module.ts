// your.module.ts
import { Module } from '@nestjs/common';
import { WhitelistService } from './whitelist.service';
import { WhitelistCommand } from './whitelist.command';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { WhitelistSchema } from './schema/whitelist.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: 'Whitelist', schema: WhitelistSchema }]),
  ],
  providers: [WhitelistService, WhitelistCommand],
})
export class WhitelistModule {}
