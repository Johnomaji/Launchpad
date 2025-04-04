import { Module } from '@nestjs/common';
import { MemecoinsService } from './memecoins.service';
import { MemecoinsController } from './memecoins.controller';

@Module({
  controllers: [MemecoinsController],
  providers: [MemecoinsService],
})
export class MemecoinsModule {}
