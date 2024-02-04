import { Module } from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [BlockchainModule, HttpModule, ScheduleModule.forRoot()],
  providers: [MonitorService],
})
export class MonitorModule {}
