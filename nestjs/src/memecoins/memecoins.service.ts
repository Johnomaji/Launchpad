import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Memecoin, MemecoinSchema } from './schemas/memecoins.schema';
import { CreateCoinDto } from '@coin-creator/dto/create-coin.dto';
import { CoinCreation } from '@coin-creator/interfaces/coin-creation.interface';
import { CoinCreatorService } from '@coin-creator/coin-creator.service';
import { User } from '@users/schemas/users.schema';
import { CreateMemecoinDto } from './dto/create-memecoin.dto';
import { IMemecoinCreation } from './interfaces/memecoins.interface';

@Injectable()
export class MemecoinsService {
  constructor(
    @InjectModel(Memecoin.name) private memecoinModel: Model<Memecoin>,
    private readonly coinCreatorService: CoinCreatorService,
  ) {}

  async createCoin(
    createMemecoinDto: CreateMemecoinDto,
    user: User,
  ): Promise<IMemecoinCreation> {
    const existingCoin = await this.memecoinModel.findOne({
      name: createMemecoinDto.name,
    });
    if (existingCoin) {
      throw new BadRequestException('Memecoin with this name already exists');
    }

    try {
      const coinObj: CreateCoinDto = {
        description: createMemecoinDto.desc,
        name: createMemecoinDto.name,
        symbol: createMemecoinDto.ticker,
        iconUrl: createMemecoinDto.image,
        network: 'testnet',
      };

      const coinCreationResult =
        await this.coinCreatorService.createCoin(coinObj);

      const newMemecoin = await this.memecoinModel.create({
        name: createMemecoinDto.name,
        ticker: createMemecoinDto.ticker,
        coinAddress: coinCreationResult.publishResult.packageId || '',
        creator: user._id,
        image: createMemecoinDto.image || '',
        desc: createMemecoinDto.desc,
        xSocial: createMemecoinDto.xSocial,
        telegramSocial: createMemecoinDto.telegramSocial,
        discordSocial: createMemecoinDto.discordSocial,
      });

      return { ...coinCreationResult, _id: newMemecoin._id as string };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create memecoin: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<Memecoin[]> {
    return this.memecoinModel
      .find()
      .populate('creator', 'walletAddress')
      .exec();
  }

  async findById(id: string): Promise<Memecoin> {
    const memecoin = await this.memecoinModel
      .findById(id)
      .populate('creator', 'walletAddress')
      .exec();

    if (!memecoin) {
      throw new NotFoundException(`Memecoin with ID ${id} not found`);
    }

    return memecoin;
  }

  async findByCreator(creatorId: string): Promise<Memecoin[]> {
    return this.memecoinModel
      .find({ creator: creatorId })
      .populate('creator', 'walletAddress')
      .exec();
  }
}
