import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { MemecoinsController } from './memecoins.controller';
import { MemecoinsService } from './memecoins.service';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { CreateMemecoinDto } from './dto/create-memecoin.dto';
import { User } from '@users/schemas/users.schema';
import { CoinCreation } from '@coin-creator/interfaces/coin-creation.interface';
import { Types } from 'mongoose';
import { Memecoin } from './schemas/memecoins.schema';
import { Transaction } from '@mysten/sui/transactions';
import { PublishResult } from '@coin-creator/interfaces/publish-result.interface';

describe('MemecoinsController', () => {
  let controller: MemecoinsController;
  let service: MemecoinsService;

  const mockUser: User = {
    _id: new Types.ObjectId(),
    walletAddress: '0x1234567890abcdef',
    username: 'testuser',
    bio: 'test bio',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockTransaction = {} as unknown as Transaction;
  const mockPublishResult = {} as unknown as PublishResult;

  const mockCoinCreation: CoinCreation = {
    transaction: mockTransaction,
    publishResult: mockPublishResult,
    coinName: 'TestCoin',
    symbol: 'TEST',
  };

  const mockMemecoin: Memecoin = {
    _id: new Types.ObjectId(),
    name: 'TestCoin',
    ticker: 'TEST',
    coinAddress: '0xcoinaddress123',
    creator: mockUser,
    image: 'test-image-url',
    desc: 'Test description',
    totalCoins: 1000000,
    xSocial: 'https://x.com/testcoin',
    telegramSocial: 'https://t.me/testcoin',
    discordSocial: 'https://discord.gg/testcoin',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Memecoin;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemecoinsController],
      providers: [
        {
          provide: MemecoinsService,
          useValue: {
            createCoin: jest.fn().mockResolvedValue(mockCoinCreation),
            findAll: jest.fn().mockResolvedValue([mockMemecoin]),
            findById: jest.fn().mockResolvedValue(mockMemecoin),
            findByCreator: jest.fn().mockResolvedValue([mockMemecoin]),
          },
        },
      ],
    }).compile();

    controller = module.get<MemecoinsController>(MemecoinsController);
    service = module.get<MemecoinsService>(MemecoinsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMemecoin', () => {
    it('should create a new memecoin and return creation data', async () => {
      const createDto: CreateMemecoinDto = {
        name: 'TestCoin',
        ticker: 'TEST',
        desc: 'Test description',
	    image: 'https://example.com/icon.png',
	    totalCoins: 1000000,
	    xSocial: 'http://x.com/test',
	    telegramSocial: 'http://t.me/test',
	    discordSocial: 'http://discord.gg/test',
	    initialSupply: 500000,
	    decimals: 8,
      };

      const result = await controller.createMemecoin(createDto, mockUser);

      expect(service.createCoin).toHaveBeenCalledWith(createDto, mockUser);
      expect(result).toEqual(mockCoinCreation);
      expect(result.coinName).toBe('TestCoin');
      expect(result.symbol).toBe('TEST');
    });
  });

  describe('getAllMemecoins', () => {
    it('should return an array of all memecoins', async () => {
      const result = await controller.getAllMemecoins();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockMemecoin]);
      expect(result[0].name).toBe('TestCoin');
      expect(result[0].creator.walletAddress).toBe('0x1234567890abcdef');
    });
  });

  describe('getMemecoinById', () => {
    it('should return a memecoin by its ID with populated creator walletAddress', async () => {
      const populatedMemecoin = {
        ...mockMemecoin,
        creator: {
          _id: mockUser._id,
          walletAddress: mockUser.walletAddress,
        },
      } as unknown as Memecoin;

      jest.spyOn(service, 'findById').mockResolvedValue(populatedMemecoin);

      const memecoinId = mockMemecoin._id.toString();
      const result = await controller.getMemecoinById(memecoinId);

      expect(service.findById).toHaveBeenCalledWith(memecoinId);
      expect(result).toEqual(populatedMemecoin);
      expect(result.creator.walletAddress).toBe('0x1234567890abcdef');
      expect(result.creator).toHaveProperty('_id', mockUser._id);
      expect(result.creator).not.toHaveProperty('username');
    });

    it('should throw NotFoundException for invalid ID', async () => {
      jest
        .spyOn(service, 'findById')
        .mockRejectedValue(
          new NotFoundException('Memecoin with ID invalid-id not found'),
        );

      await expect(controller.getMemecoinById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getMemecoinById('invalid-id')).rejects.toThrow(
        'Memecoin with ID invalid-id not found',
      );
    });
  });

  describe('getMemecoinsByCreator', () => {
    it('should return memecoins created by the specific user', async () => {
      const creatorId = mockUser._id.toString();
      const result = await controller.getMemecoinsByCreator(mockUser);

      expect(service.findByCreator).toHaveBeenCalledWith(mockUser._id);
      expect(result).toEqual([mockMemecoin]);
      expect(result[0].creator._id).toEqual(mockUser._id);
    });

    it('should return empty array for creator with no memecoins', async () => {
      jest.spyOn(service, 'findByCreator').mockResolvedValue([]);

      const result = await controller.getMemecoinsByCreator(mockUser);
      expect(result).toEqual([]);
    });
  });

  describe('guards', () => {
    it('should protect createMemecoin with JwtAuthGuard', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        controller.createMemecoin,
      );
      expect(guards).toHaveLength(1);
      expect(new guards[0]()).toBeInstanceOf(JwtAuthGuard);
    });

    it('should protect getMemecoinsByCreator with JwtAuthGuard', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        controller.getMemecoinsByCreator,
      );
      expect(guards).toHaveLength(1);
      expect(new guards[0]()).toBeInstanceOf(JwtAuthGuard);
    });

  });
});
