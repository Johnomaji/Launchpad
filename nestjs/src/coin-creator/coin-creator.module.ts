import { Module } from '@nestjs/common';
import { CoinCreatorService } from './coin-creator.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import suiConfig from './config/sui.config';

@Module({
  imports: [ConfigModule.forFeature(suiConfig)],
  providers: [CoinCreatorService, ConfigService],
  exports: [CoinCreatorService],
})
export class CoinCreatorModule {}
