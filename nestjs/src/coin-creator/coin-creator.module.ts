import { Module } from '@nestjs/common';
import { CoinCreatorService } from './coin-creator.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoinCreatorController } from './coin-creator.controller';
import suiConfig from './config/sui.config';

@Module({
  imports: [ConfigModule.forFeature(suiConfig)],
  providers: [CoinCreatorService, ConfigService],
  exports: [CoinCreatorService],
  controllers: [CoinCreatorController],
})
export class CoinCreatorModule {}
