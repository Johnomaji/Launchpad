import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MemecoinsService } from './memecoins.service';
import { CoinCreation } from '@coin-creator/interfaces/coin-creation.interface';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { User as UserEntity } from '@users/schemas/users.schema';
import { User } from '@users/users.decorator';
import { CreateMemecoinDto } from './dto/create-memecoin.dto';
import { Memecoin } from './schemas/memecoins.schema';

@ApiTags('Memecoins')
@Controller('memecoins')
export class MemecoinsController {
  constructor(private readonly memecoinsService: MemecoinsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new memecoin' })
  @ApiResponse({
    status: 201,
    description: 'Memecoin successfully created',
    type: Memecoin,
  })
  async createMemecoin(
    @Body() createMemecoinDto: CreateMemecoinDto,
    @User() user: UserEntity,
  ): Promise<CoinCreation> {
    return this.memecoinsService.createCoin(createMemecoinDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all memecoins' })
  @ApiResponse({
    status: 200,
    description: 'List of all memecoins',
    type: [Memecoin],
  })
  async getAllMemecoins() {
    return this.memecoinsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a memecoin by its ID' })
  @ApiParam({ name: 'id', description: 'The ID of the memecoin' })
  @ApiResponse({
    status: 200,
    description: 'The memecoin with the given ID',
    type: Memecoin,
  })
  async getMemecoinById(@Param('id') id: string) {
    return this.memecoinsService.findById(id);
  }

  @Get('creator/:creatorId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all memecoins created by a specific user' })
  @ApiParam({ name: 'creatorId', description: 'The ID of the creator user' })
  @ApiResponse({
    status: 200,
    description: 'List of memecoins created by the user',
    type: [Memecoin],
  })
  async getMemecoinsByCreator(@Param('creatorId') creatorId: string) {
    return this.memecoinsService.findByCreator(creatorId);
  }
}
