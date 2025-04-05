import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateCoinDto } from './dto/create-coin.dto';
import { CoinCreation } from './interfaces/coin-creation.interface';
import { CoinCreatorService } from './coin-creator.service';

@Controller('coins')
export class CoinCreatorController {
  constructor(private readonly coinCreatorService: CoinCreatorService) {}

  @Post()
  async createCoin(
    @Body() createCoinDto: CreateCoinDto,
  ): Promise<CoinCreation> {
    try {
      return await this.coinCreatorService.createCoin(createCoinDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
