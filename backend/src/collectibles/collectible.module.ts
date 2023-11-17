import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CollectibleSchema } from './schema/collectible.schema';
import { CollectibleService } from './collectible.service';
import { CollectibleController } from './collectible.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Collectible', schema: CollectibleSchema },
    ]),
  ],
  controllers: [CollectibleController],
  providers: [CollectibleService, ConfigService],
})
export class AuthModule {}
