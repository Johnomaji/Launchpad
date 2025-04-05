import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Memecoin } from './schemas/memecoins.schema';
import { CreateCoinDto } from './dto/create-coin.dto';
import { CoinCreation } from './interfaces/coin-creation.interface';
import { CoinCreatorService } from '@coin-creator/coin-creator.service';
import { User } from '@users/schemas/users.schema';

@Injectable()
export class MemecoinsService {
  constructor(
    @InjectModel(Memecoin.name) private memecoinModel: Model<Memecoin>,
    private readonly coinCreatorService: CoinCreatorService,
  ) {}

  async createCoin(createCoinDto: CreateCoinDto, user: User): Promise<CoinCreation> {
    const existingCoin = await this.memecoinModel.findOne({ name: createCoinDto.name });
    if (existingCoin) {
      throw new BadRequestException('Memecoin with this name already exists');
    }

    try {
      const coinCreationResult = await this.coinCreatorService.createCoin(createCoinDto);

      const newMemecoin = new this.memecoinModel({
        name: createCoinDto.name,
        ticker: createCoinDto.symbol,
        coinAddress: coinCreationResult.publishResult.packageId || '',
        creator: user._id,
        image: createCoinDto.iconUrl || '',
        desc: createCoinDto.description,
        xSocial: '',
        telegramSocial: '',
        discordSocial: '',
      });

      await newMemecoin.save();

      return coinCreationResult;
    } catch (error) {
      throw new BadRequestException(`Failed to create memecoin: ${error.message}`);
    }
  }

  async findAll(): Promise<Memecoin[]> {
    return this.memecoinModel.find().populate('creator', 'walletAddress').exec();
  }

  async findById(id: string): Promise<Memecoin> {
    const memecoin = await this.memecoinModel.findById(id).populate('creator', 'walletAddress').exec();
    
    if (!memecoin) {
      throw new NotFoundException(`Memecoin with ID ${id} not found`);
    }
    
    return memecoin;
  }

  async findByCreator(creatorId: string): Promise<Memecoin[]> {
    return this.memecoinModel.find({ creator: creatorId }).populate('creator', 'walletAddress').exec();
  }
}
