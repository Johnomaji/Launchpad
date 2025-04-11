import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { verifyPersonalMessageSignature } from '@mysten/sui/verify';
import { User } from '@users/schemas/users.schema';
import { Challenge } from './schemas/challenge.schema';

jest.mock('@mysten/sui/verify', () => ({
  verifyPersonalMessageSignature: jest.fn(),
}));

class MockChallengeModel {
  constructor(private data: any) {}

  static create = jest.fn((data) => new MockChallengeModel(data));

  save = jest.fn().mockResolvedValue(this);

  static findOne = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(null),
  });

  static find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  });

  static findByIdAndDelete = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(true),
  });
}

class MockUserModel {
  constructor(private data: any) {}

  static create = jest.fn((data) => new MockUserModel(data));

  save = jest.fn().mockResolvedValue(this);

  static findOne = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(null),
  });

  static find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  });

  static findByIdAndDelete = jest.fn().mockResolvedValue(true);
}

describe('AuthService', () => {
  let authService: AuthService;
  let userModel: Model<User>;
  let challengeModel: Model<Challenge>;
  let jwtService: JwtService;

  const mockTextEncoder = {
    encode: jest.fn().mockReturnValue(new Uint8Array(10)),
  };
  global.TextEncoder = jest.fn().mockImplementation(() => mockTextEncoder);

  const mockRandomBytes = jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mockedNonce'),
  });
  (crypto.randomBytes as jest.Mock) = mockRandomBytes;

  const mockVerifySignature = verifyPersonalMessageSignature as jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: getModelToken(User.name),
          useValue: MockUserModel,
        },
        {
          provide: getModelToken(Challenge.name),
          useValue: MockChallengeModel,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    challengeModel = module.get<Model<Challenge>>(
      getModelToken(Challenge.name),
    );
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  // describe('generateChallenge', () => {
  //   it('should create and return a challenge', async () => {
  //     const address = '0x123';
  //     const nonce = crypto.randomBytes(16).toString('hex');
  //     jest.spyOn(challengeModel, 'create').mockResolvedValueOnce({} as any);
  //
  //     const result = await authService.generateChallenge(address);
  //     expect(result.challenge).toContain('Sign this message');
  //     expect(result.nonce).toHaveLength(32);
  //     expect(challengeModel.create).toHaveBeenCalledWith(
  //       expect.objectContaining({ address, nonce, challenge: result.challenge }),
  //     );
  //   });
  // });

  describe('generateChallenge', () => {
    it('should generate a challenge message with a nonce', async () => {
      const address = '0x123';
      const expectedChallenge =
        'Sign this message to authenticate with our app: mockedNonce';

      await authService.generateChallenge(address);

      expect(crypto.randomBytes).toHaveBeenCalledWith(16);
      expect(challengeModel.create).toHaveBeenCalledWith({
        address,
        challenge: expectedChallenge,
        nonce: 'mockedNonce',
      });
    });

    it('should return the challenge and nonce', async () => {
      const address = '0x123';
      const result = await authService.generateChallenge(address);

      expect(result).toEqual({
        challenge:
          'Sign this message to authenticate with our app: mockedNonce',
        nonce: 'mockedNonce',
      });
    });

    it('should handle errors during challenge creation', async () => {
      const address = '0x123';
      (challengeModel.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB Error'),
      );

      await expect(authService.generateChallenge(address)).rejects.toThrow(
        'DB Error',
      );
    });
  });

  describe('verifySignature', () => {
    it('should verify a valid signature and create user if necessary', async () => {
      const address = '0x123';
      const signature = 'fake_signature';
      const message = 'Sign this message to authenticate with our app: abc123';

      (verifyPersonalMessageSignature as jest.Mock).mockResolvedValueOnce(true);

      jest.spyOn(userModel, 'findOne').mockImplementation(
        () =>
          ({
            exec: jest.fn().mockResolvedValue(null),
            save: jest.fn(),
          }) as any,
      );
      jest.spyOn(userModel, 'create').mockImplementation((userData: any) => {
        console.log('Mock create called with:', userData);
        return Object.assign({}, userData, {
          save: jest.fn().mockResolvedValue(true),
        });
      });
      jest.spyOn(challengeModel, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(true),
      } as any);

      const mockChallengeFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([
              {
                _id: 'challengeId',
                challenge: message,
                address,
              },
            ]),
          }),
        }),
        exec: jest.fn().mockResolvedValue([
          {
            _id: 'challengeId',
            challenge: message,
            address,
          },
        ]),
      });
      jest.spyOn(challengeModel, 'find').mockImplementation(mockChallengeFind);

      const result = await authService.verifySignature(
        address,
        signature,
        message,
      );

      console.log(result);
      expect(result).toBe(true);
      expect(mockChallengeFind).toHaveBeenCalledWith({ address });
      expect(userModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ walletAddress: address }),
      );
      expect(challengeModel.findByIdAndDelete).toHaveBeenCalledWith(
        'challengeId',
      );
    });

    it('should return false if the signature is invalid', async () => {
      const address = '0x123';
      const signature = 'invalid_signature';
      const message = 'Sign this message to authenticate with our app: abc123';

      const mockChallengeFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([{ challenge: message }]),
          }),
        }),
        exec: jest.fn().mockResolvedValue([
          {
            _id: 'challengeId',
            challenge: message,
            address,
          },
        ]),
      });
      jest.spyOn(challengeModel, 'find').mockImplementation(mockChallengeFind);

      (verifyPersonalMessageSignature as jest.Mock).mockResolvedValueOnce(
        false,
      );

      const result = await authService.verifySignature(
        address,
        signature,
        message,
      );

      expect(result).toBe(false);
      expect(mockChallengeFind).toHaveBeenCalledWith({ address });
    });

    it('should return false if no challenge record is found', async () => {
      const address = '0x123';
      const signature = 'fake_signature';
      const message = 'Sign this message to authenticate with our app: abc123';

      const mockChallengeFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
        exec: jest.fn().mockResolvedValue([
          {
            _id: 'challengeId',
            challenge: message,
            address,
          },
        ]),
      });
      jest.spyOn(challengeModel, 'find').mockImplementation(mockChallengeFind);

      const result = await authService.verifySignature(
        address,
        signature,
        message,
      );

      expect(result).toBe(false);
      expect(mockChallengeFind).toHaveBeenCalledWith({ address });
    });

    it('should return false if challenge record does not match message', async () => {
      const address = '0x123';
      const signature = 'fake_signature';
      const message = 'Sign this message to authenticate with our app: abc123';
      const wrongMessage = 'Wrong message';

      const mockChallengeFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([
              {
                _id: 'challengeId',
                challenge: wrongMessage,
                address,
              },
            ]),
          }),
        }),
        exec: jest.fn().mockResolvedValue([
          {
            _id: 'challengeId',
            challenge: message,
            address,
          },
        ]),
      });
      jest.spyOn(challengeModel, 'find').mockImplementation(mockChallengeFind);

      const result = await authService.verifySignature(
        address,
        signature,
        message,
      );

      expect(result).toBe(false);
    });

    it('should return false if signature verification throws an error', async () => {
      const address = '0x123';
      const signature = 'fake_signature';
      const message = 'Sign this message to authenticate with our app: abc123';

      const mockChallengeFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([
              {
                _id: 'challengeId',
                challenge: message,
                address,
              },
            ]),
          }),
        }),
        exec: jest.fn().mockResolvedValue([
          {
            _id: 'challengeId',
            challenge: message,
            address,
          },
        ]),
      });
      jest.spyOn(challengeModel, 'find').mockImplementation(mockChallengeFind);

      (verifyPersonalMessageSignature as jest.Mock).mockRejectedValueOnce(
        new Error('Verification failed'),
      );

      const result = await authService.verifySignature(
        address,
        signature,
        message,
      );

      expect(result).toBe(false);
    });
    it('should not create user if user already exists', async () => {
      const address = '0x123';
      const signature = 'fake_signature';
      const message = 'sign this message to authenticate with our app: abc123';

      (verifyPersonalMessageSignature as jest.Mock).mockResolvedValueOnce(true);

      const existingUser = { walletAddress: address, _id: 'userId' };
      const mockFindOne = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ walletAddress: address, _id: 'userId' }),
      });
      jest.spyOn(userModel, 'findOne').mockImplementation(mockFindOne);
      // jest.spyOn(userModel, 'findOne').mockReturnValue({
      //   exec: jest.fn().mockResolvedValue(existingUser),
      // } as any);

      jest.spyOn(userModel, 'create').mockImplementation(() => {
        throw new Error('Should not be called');
      });

      const mockChallengeFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([
              {
                _id: 'challengeId',
                challenge: message,
                address,
              },
            ]),
          }),
        }),
        exec: jest.fn().mockResolvedValue([
          {
            _id: 'challengeId',
            challenge: message,
            address,
          },
        ]),
      });

      jest.spyOn(challengeModel, 'find').mockImplementation(mockChallengeFind);

      const result = await authService.verifySignature(
        address,
        signature,
        message,
      );

      expect(result).toBe(true);
      expect(userModel.findOne).toHaveBeenCalledWith({
        walletAddress: address,
      });
      expect(mockFindOne().exec).toHaveBeenCalled();
      expect(userModel.create).not.toHaveBeenCalled();
    });

    it('should still return true if challenge deletion fails', async () => {
      const address = '0x123';
      const signature = 'fake_signature';
      const message = 'Sign this message to authenticate with our app: abc123';

      (verifyPersonalMessageSignature as jest.Mock).mockResolvedValueOnce(true);
      jest.spyOn(userModel, 'findOne').mockImplementation(
        () =>
          ({
            exec: jest.fn().mockResolvedValue(null),
            save: jest.fn(),
          }) as any,
      );
      jest
        .spyOn(userModel, 'create')
        .mockResolvedValueOnce({ save: jest.fn() } as any);
      jest.spyOn(challengeModel, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockImplementation(() => {
          throw new Error('Deletion failed!');
        }),
      } as any);

      const mockChallengeFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([
              {
                _id: 'challengeId',
                challenge: message,
                address,
              },
            ]),
          }),
        }),
        exec: jest.fn().mockResolvedValue([
          {
            _id: 'challengeId',
            challenge: message,
            address,
          },
        ]),
      });
      jest.spyOn(challengeModel, 'find').mockImplementation(mockChallengeFind);

      const result = await authService.verifySignature(
        address,
        signature,
        message,
      );

      expect(result).toBe(true);
    });
  });
  describe('generateToken', () => {
    it('should generate a JWT token', async () => {
      const address = '0x123';
      const token = 'jwt_token';
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await authService.generateToken(address);
      expect(result).toBe(token);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: address });
    });
  });
});
