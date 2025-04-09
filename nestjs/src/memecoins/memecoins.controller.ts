
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  BadRequestException,
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
import { IMemecoinCreation } from './interfaces/memecoins.interface';

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
  ): Promise<IMemecoinCreation> {
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
    try {
          this.memecoinsService.findById(id);
	} catch (error) {
		if (error.name === 'CastError') {
    		return new BadRequestException("Invalid ID provided!");
	    }
	}
  }

  @Get('creator')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all memecoins created by the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of memecoins created by the user',
    type: [Memecoin],
  })
  async getMemecoinsByCreator(@User() user: UserEntity) {
    return this.memecoinsService.findByCreator(user._id as string);
  }
}
