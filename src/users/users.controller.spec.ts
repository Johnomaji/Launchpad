import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/users.schema';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser: Partial<User> = {
    _id: 'user-id-1',
    walletAddress: '0x123456789abcdef',
    username: 'testuser',
    bio: 'Test bio',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersList: Partial<User>[] = [
    mockUser,
    {
      _id: 'user-id-2',
      walletAddress: '0xabcdef123456789',
      username: 'testuser2',
      bio: 'Test bio 2',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByWalletAddress: jest.fn(),
    update: jest.fn(),
    updateByWalletAddress: jest.fn(),
    remove: jest.fn(),
    removeByWalletAddress: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        walletAddress: '0x123456789abcdef',
        username: 'testuser',
        bio: 'Test bio',
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      mockUsersService.findAll.mockResolvedValue(mockUsersList);

      const result = await controller.findAll();

      expect(result).toEqual(mockUsersList);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should find a user by id', async () => {
      const userId = 'user-id-1';
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(userId);

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(userId);
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByWalletAddress', () => {
    it('should find a user by wallet address', async () => {
      const walletAddress = '0x123456789abcdef';
      mockUsersService.findByWalletAddress.mockResolvedValue(mockUser);

      const result = await controller.findByWalletAddress(walletAddress);

      expect(result).toEqual(mockUser);
      expect(service.findByWalletAddress).toHaveBeenCalledWith(walletAddress);
      expect(service.findByWalletAddress).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a user by id', async () => {
      const userId = 'user-id-1';
      const updateUserDto: UpdateUserDto = {
        username: 'updateduser',
        bio: 'Updated bio',
      };

      const updatedUser = {
        ...mockUser,
        username: 'updateduser',
        bio: 'Updated bio',
      };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(service.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateByWalletAddress', () => {
    it('should update a user by wallet address', async () => {
      const walletAddress = '0x123456789abcdef';
      const updateUserDto: UpdateUserDto = {
        username: 'updateduser',
        bio: 'Updated bio',
      };

      const updatedUser = {
        ...mockUser,
        username: 'updateduser',
        bio: 'Updated bio',
      };

      mockUsersService.updateByWalletAddress.mockResolvedValue(updatedUser);

      const result = await controller.updateByWalletAddress(
        walletAddress,
        updateUserDto,
      );

      expect(result).toEqual(updatedUser);
      expect(service.updateByWalletAddress).toHaveBeenCalledWith(
        walletAddress,
        updateUserDto,
      );
      expect(service.updateByWalletAddress).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should remove a user by id', async () => {
      const userId = 'user-id-1';
      mockUsersService.remove.mockResolvedValue(mockUser);

      const result = await controller.remove(userId);

      expect(result).toEqual(mockUser);
      expect(service.remove).toHaveBeenCalledWith(userId);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeByWalletAddress', () => {
    it('should remove a user by wallet address', async () => {
      const walletAddress = '0x123456789abcdef';
      mockUsersService.removeByWalletAddress.mockResolvedValue(mockUser);

      const result = await controller.removeByWalletAddress(walletAddress);

      expect(result).toEqual(mockUser);
      expect(service.removeByWalletAddress).toHaveBeenCalledWith(walletAddress);
      expect(service.removeByWalletAddress).toHaveBeenCalledTimes(1);
    });
  });
});

