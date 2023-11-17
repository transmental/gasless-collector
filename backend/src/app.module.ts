import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BlockchainService } from './blockchain/blockchain.service';
import { BlockchainController } from './blockchain/blockchain.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { AuthSchema } from './auth/schemas/auth.schema';
import { CollectibleController } from './collectibles/collectible.controller';
import { CollectibleService } from './collectibles/collectible.service';
import { CollectibleSchema } from './collectibles/schema/collectible.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    BlockchainModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.getOrThrow('MONGO_URL'),
        dbName: configService.getOrThrow('DB_NAME'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'Auth', schema: AuthSchema },
      { name: 'Collectible', schema: CollectibleSchema },
    ]),
  ],
  controllers: [
    AppController,
    BlockchainController,
    AuthController,
    CollectibleController,
  ],
  providers: [AppService, BlockchainService, AuthService, CollectibleService],
})
export class AppModule {}
