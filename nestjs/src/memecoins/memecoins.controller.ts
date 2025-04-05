import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { MemecoinsService } from './memecoins.service';
import { CoinCreation } from '@coin-creator/interfaces/coin-creation.interface';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { User as UserEntity } from '@users/schemas/users.schema';
import { User } from '@users/users.decorator';
import { CreateMemecoinDto } from './dto/create-memecoin.dto';

@Controller('memecoins')
export class MemecoinsController {
  constructor(private readonly memecoinsService: MemecoinsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createMemecoin(
    @Body() createMemecoinDto: CreateMemecoinDto,
    @User() user: UserEntity,
  ): Promise<CoinCreation> {
    return this.memecoinsService.createCoin(createMemecoinDto, user);
  }

  @Get()
  async getAllMemecoins() {
    return this.memecoinsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getMemecoinById(@Param('id') id: string) {
    return this.memecoinsService.findById(id);
  }

  @Get('creator/:creatorId')
  @UseGuards(JwtAuthGuard)
  async getMemecoinsByCreator(@Param('creatorId') creatorId: string) {
    return this.memecoinsService.findByCreator(creatorId);
  }
}
