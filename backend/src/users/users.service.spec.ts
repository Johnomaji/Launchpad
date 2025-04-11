import {Test, TestingModule} from '@nestjs/testing';
import {getModelToken} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {UsersService} from './users.service';
import {User} from './schemas/users.schema';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {NotFoundException} from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<User>;

  const mockUser = {
    _id: '652f5d51b5f5a6b6d9f85e1a',
    username: 'Test User',
    bio: 'test',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOneAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'Test User',
        bio: 'test',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      };

      mockUserModel.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(mockUserModel.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockUser]),
      });

      const result = await service.findAll();

      expect(mockUserModel.find).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findOne(mockUser._id);

      expect(mockUserModel.findById).toHaveBeenCalledWith(mockUser._id);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('nonexistentid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByWalletAddress', () => {
    it('should return a user by wallet address', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByWalletAddress(mockUser.walletAddress);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        walletAddress: mockUser.walletAddress,
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.findByWalletAddress('nonexistentaddress'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user by id', async () => {
      const updateUserDto: UpdateUserDto = {username: 'Updated Name'};
      const updatedUser = {...mockUser, name: 'Updated Name'};

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      });

      const result = await service.update(mockUser._id, updateUserDto);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser._id,
        updateUserDto,
        {new: true},
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update('nonexistentid', {} as UpdateUserDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateByWalletAddress', () => {
    it('should update a user by wallet address', async () => {
      const updateUserDto: UpdateUserDto = {username: 'Updated Name'};
      const updatedUser = {...mockUser, name: 'Updated Name'};

      mockUserModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      });

      const result = await service.updateByWalletAddress(
        mockUser.walletAddress,
        updateUserDto,
      );

      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        {walletAddress: mockUser.walletAddress},
        updateUserDto,
        {new: true},
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateByWalletAddress(
          'nonexistentaddress',
          {} as UpdateUserDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user by id', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.remove(mockUser._id);

      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(
        mockUser._id,
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('nonexistentid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeByWalletAddress', () => {
    it('should remove a user by wallet address', async () => {
      mockUserModel.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.removeByWalletAddress(
        mockUser.walletAddress,
      );

      expect(mockUserModel.findOneAndDelete).toHaveBeenCalledWith({
        walletAddress: mockUser.walletAddress,
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.removeByWalletAddress('nonexistentaddress'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
