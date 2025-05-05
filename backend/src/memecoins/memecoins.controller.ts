import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiBody,
  ApiOkResponse,
} from '@nestjs/swagger';
import { MemecoinsService } from './memecoins.service';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { User as UserEntity } from '@users/schemas/users.schema';
import { User } from '@users/users.decorator';
import { CreateMemecoinDto } from './dto/create-memecoin.dto';
import { MemecoinResponseDto } from './dto/memecoins-response.dto';
import { MemecoinDto } from './dto/memecoins.dto';
import { ExceptionResponseDto } from '@common/dto/exception-response.dto';
import { CoinCreationResponseDto } from './dto/coin-creation-response.dto';

@ApiTags('Memecoins')
@Controller('memecoins')
export class MemecoinsController {
  constructor(private readonly memecoinsService: MemecoinsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new memecoin' })
  @ApiBody({ type: CreateMemecoinDto })
  @ApiResponse({
    status: 201,
    description: 'Memecoin successfully created',
    type: CoinCreationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    type: ExceptionResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: ExceptionResponseDto,
  })
  async createMemecoin(
    @Body() createMemecoinDto: CreateMemecoinDto,
    @User() user: UserEntity,
  ) {
    return this.memecoinsService.createCoin(createMemecoinDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all memecoins' })
  @ApiOkResponse({
    description: 'List of all memecoins',
    type: [MemecoinResponseDto],
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: ExceptionResponseDto,
  })
  async getAllMemecoins() {
    return this.memecoinsService.findAll();
  }

  @Get('creator')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all memecoins created by the authenticated user',
  })
  @ApiOkResponse({
    description: 'List of memecoins created by the user',
    type: [MemecoinResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    type: ExceptionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Memecoin not found',
    type: ExceptionResponseDto,
  })
  async getMemecoinsByCreator(@User() user: UserEntity) {
    return this.memecoinsService.findByCreator(user._id as string);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a memecoin by its ID' })
  @ApiParam({ name: 'id', description: 'The ID of the memecoin', type: String, example: '5d3a21e47b' })
  @ApiOkResponse({
    description: 'The memecoin with the given ID',
    type: MemecoinResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    type: ExceptionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Memecoin not found',
    type: ExceptionResponseDto,
  })
  async getMemecoinById(@Param('id') id: string) {
    try {
      return this.memecoinsService.findById(id);
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid ID provided!');
      }
      throw error;
    }
  }
}
