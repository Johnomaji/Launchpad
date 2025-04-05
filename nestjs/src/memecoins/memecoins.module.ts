import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MemecoinsController } from './memecoins.controller';
import { MemecoinsService } from './memecoins.service';
import { Memecoin, MemecoinSchema } from './schemas/memecoins.schema';
import { CoinCreatorModule } from '@coin-creator/coin-creator.module';
import { CoinCreatorService } from '@coin-creator/coin-creator.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Memecoin.name, schema: MemecoinSchema },
    ]),
    CoinCreatorModule,
  ],
  controllers: [MemecoinsController],
  providers: [MemecoinsService, CoinCreatorService, ConfigService],
  exports: [MemecoinsService],
})
export class MemecoinsModule {}
