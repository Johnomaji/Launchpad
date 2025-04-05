import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MemecoinsService } from './memecoins.service';
import { CoinCreatorService } from '@coin-creator/coin-creator.service';
import { CreateMemecoinDto } from './dto/create-memecoin.dto';
import { Memecoin } from './schemas/memecoins.schema';
import { User } from '@users/schemas/users.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CoinCreation } from "@coin-creator/interfaces/coin-creation.interface";

describe('MemecoinsService', () => {
  let service: MemecoinsService;
  let memecoinModel: Model<Memecoin>;
  let coinCreatorService: CoinCreatorService;

  const mockUser: Partial<User> = {
    _id: '507f1f77bcf86cd799439011',
    walletAddress: '0x1234567890abcdef',
  };

  const mockCreateMemecoinDto: CreateMemecoinDto = {
    name: 'TestCoin',
    ticker: 'TEST',
    desc: 'Test description',
    image: 'http://test.com/image.png',
    xSocial: 'http://x.com/test',
    coinAddress: '0xffp',
    telegramSocial: 'http://t.me/test',
    discordSocial: 'http://discord.gg/test',
  };

  const mockCoinCreationResult: CoinCreation {
    transaction: {
      digest: '7y3h9s8d2h1j9k3l8p0o2i9u7y6t5r4e3',
      rawTransaction: '0xmockrawtransactiondata',
      effects: {
        status: { status: 'success' },
        gasUsed: {
          computationCost: 1000,
          storageCost: 500,
          storageRebate: 200,
        },
      },
    },
    publishResult: {
      success: true,
      packageId: '0x123',
      transactionDigest: '7y3h9s8d2h1j9k3l8p0o2i9u7y6t5r4e3',
      response: {
        digest: '7y3h9s8d2h1j9k3l8p0o2i9u7y6t5r4e3',
        effects: {
          status: { status: 'success' },
          gasUsed: {
            computationCost: 1000,
            storageCost: 500,
            storageRebate: 200,
          },
        },
      } as SuiTransactionBlockResponse,
    },
    coinName: 'TestCoin',
    symbol: 'TEST',
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemecoinsService,
        {
          provide: getModelToken(Memecoin.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            populate: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: CoinCreatorService,
          useValue: {
            createCoin: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MemecoinsService>(MemecoinsService);
    memecoinModel = module.get<Model<Memecoin>>(getModelToken(Memecoin.name));
    coinCreatorService = module.get<CoinCreatorService>(CoinCreatorService);
  });

  describe('createCoin', () => {
    it('should successfully create a new memecoin', async () => {
      jest.spyOn(memecoinModel, 'findOne').mockResolvedValueOnce(null);
      jest
        .spyOn(coinCreatorService, 'createCoin')
        .mockResolvedValueOnce(mockCoinCreationResult);
      jest.spyOn(memecoinModel, 'create').mockImplementationOnce(() => ({
        save: jest.fn().mockResolvedValueOnce({
          ...mockCreateMemecoinDto,
          coinAddress: mockCoinCreationResult.publishResult.packageId,
          creator: mockUser._id,
        }),
      }));

      const result = await service.createCoin(
        mockCreateMemecoinDto,
        mockUser as User,
      );
      expect(result).toEqual(mockCoinCreationResult);
      expect(memecoinModel.findOne).toHaveBeenCalledWith({
        name: mockCreateMemecoinDto.name,
      });
      expect(coinCreatorService.createCoin).toHaveBeenCalled();
      expect(memecoinModel.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if memecoin name already exists', async () => {
      jest
        .spyOn(memecoinModel, 'findOne')
        .mockResolvedValueOnce({ name: 'ExistingCoin' });

      await expect(
        service.createCoin(mockCreateMemecoinDto, mockUser as User),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if coin creation fails', async () => {
      jest.spyOn(memecoinModel, 'findOne').mockResolvedValueOnce(null);
      jest
        .spyOn(coinCreatorService, 'createCoin')
        .mockRejectedValueOnce(new Error('Creation failed'));

      await expect(
        service.createCoin(mockCreateMemecoinDto, mockUser as User),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of memecoins', async () => {
      const mockMemecoins = [
        {
          name: 'TestCoin1',
          ticker: 'TEST1',
          creator: mockUser._id,
        },
        {
          name: 'TestCoin2',
          ticker: 'TEST2',
          creator: mockUser._id,
        },
      ];

      jest.spyOn(memecoinModel, 'find').mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce(mockMemecoins),
        }),
      } as any);

      const result = await service.findAll();
      expect(result).toEqual(mockMemecoins);
      expect(memecoinModel.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a memecoin by id', async () => {
      const mockMemecoin = {
        _id: '507f1f77bcf86cd799439012',
        name: 'TestCoin',
        creator: mockUser._id,
      };

      jest.spyOn(memecoinModel, 'findById').mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce(mockMemecoin),
        }),
      } as any);

      const result = await service.findById('507f1f77bcf86cd799439012');
      expect(result).toEqual(mockMemecoin);
      expect(memecoinModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012',
      );
    });

    it('should throw NotFoundException if memecoin not found', async () => {
      jest.spyOn(memecoinModel, 'findById').mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce(null),
        }),
      } as any);

      await expect(service.findById('nonexistentid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByCreator', () => {
    it('should return memecoins by creator id', async () => {
      const mockMemecoins = [
        {
          name: 'CreatorCoin1',
          creator: mockUser._id,
        },
        {
          name: 'CreatorCoin2',
          creator: mockUser._id,
        },
      ];

      jest.spyOn(memecoinModel, 'find').mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce(mockMemecoins),
        }),
      } as any);

      const result = await service.findByCreator(mockUser._id);
      expect(result).toEqual(mockMemecoins);
      expect(memecoinModel.find).toHaveBeenCalledWith({
        creator: mockUser._id,
      });
    });
  });
});
