import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Challenge, ChallengeSchema } from './schemas/challenge.schema';
import { User, UserSchema } from '@users/schemas/users.schema';
import mongoose, { Model } from 'mongoose';
import * as crypto from 'crypto';
import { verifyPersonalMessageSignature } from '@mysten/sui/verify';
import { UnauthorizedException } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';

jest.mock('@mysten/sui/verify', () => ({
  verifyPersonalMessageSignature: jest.fn(),
}));

describe('AuthModule Integration Tests', () => {
  let authController: AuthController;
  let authService: AuthService;
  let jwtService: JwtService;
  let challengeModel: Model<Challenge>;
  let userModel: Model<User>;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Challenge.name, schema: ChallengeSchema },
          { name: User.name, schema: UserSchema },
        ]),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => {
            console.log(configService);

            const { privateKey, publicKey } = crypto.generateKeyPairSync(
              'rsa',
              {
                modulusLength: 2048,
                publicKeyEncoding: { type: 'spki', format: 'pem' },
                privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
              },
            );

            return {
              privateKey,
              publicKey,
              signOptions: {
                algorithm: 'RS256',
                expiresIn: '1h',
              },
              verifyOptions: {
                algorithms: ['RS256'],
              },
            };
          },
          inject: [ConfigService],
        }),
      ],
      controllers: [AuthController],
      providers: [AuthService, JwtStrategy],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    challengeModel = module.get<Model<Challenge>>(
      getModelToken(Challenge.name),
    );
    userModel = module.get<Model<User>>(getModelToken(User.name));

    await challengeModel.deleteMany({});
    await userModel.deleteMany({});
  }, 80_000);

  afterEach(async () => {
    await Promise.all([
      challengeModel.deleteMany({}),
      userModel.deleteMany({}),
    ]);
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await challengeModel.deleteMany({});
    await userModel.deleteMany({});
    await mongoose.disconnect();
    await mongod.stop();
  });

  describe('Challenge Generation', () => {
    it('should generate a challenge for a given address', async () => {
      const address = '0x1234567890abcdef';
      const result = await authController.getChallenge({ address });

      expect(result).toHaveProperty('challenge');
      expect(result).toHaveProperty('nonce');
      expect(result.challenge).toContain(result.nonce);

      const challenges = await challengeModel.find({ address }).exec();
      expect(challenges.length).toBe(1);
      expect(challenges[0].challenge).toBe(result.challenge);
      expect(challenges[0].nonce).toBe(result.nonce);
    });

    it('should generate different challenges for the same address', async () => {
      const address = '0x1234567890abcdef';
      const result1 = await authService.generateChallenge(address);
      const result2 = await authService.generateChallenge(address);

      expect(result1.challenge).not.toBe(result2.challenge);
      expect(result1.nonce).not.toBe(result2.nonce);

      const challenges = await challengeModel.find({ address }).exec();
      expect(challenges.length).toBe(2);
    });
  });

  describe('Signature Verification', () => {
    const testAddress = '0x1234567890abcdef';
    const testSignature = 'testSignature';
    let testChallenge: string;
    let testNonce: string;

    beforeEach(async () => {
      const result = await authService.generateChallenge(testAddress);
      testChallenge = result.challenge;
      testNonce = result.nonce;

      (verifyPersonalMessageSignature as jest.Mock).mockResolvedValue(true);
    });

    it('should verify a valid signature and create user if not exists', async () => {
      const isValid = await authService.verifySignature(
        testAddress,
        testSignature,
        testChallenge,
      );

      expect(isValid).toBe(true);
      console.log(testNonce);

      const user = await userModel
        .findOne({ walletAddress: testAddress })
        .exec();
      expect(user).toBeDefined();
      expect(user?.walletAddress).toBe(testAddress);

      const challenge = await challengeModel
        .findOne({ address: testAddress })
        .exec();
      expect(challenge).toBeNull();
    });

    it('should verify a valid signature for existing user', async () => {
      await userModel.create({ walletAddress: testAddress });

      const isValid = await authService.verifySignature(
        testAddress,
        testSignature,
        testChallenge,
      );

      expect(isValid).toBe(true);

      const users = await userModel.find({ walletAddress: testAddress }).exec();
      expect(users.length).toBe(1);
    });

    it('should reject invalid signature', async () => {
      (verifyPersonalMessageSignature as jest.Mock).mockResolvedValue(false);

      const isValid = await authService.verifySignature(
        testAddress,
        'invalidSignature',
        testChallenge,
      );

      expect(isValid).toBe(false);

      const user = await userModel
        .findOne({ walletAddress: testAddress })
        .exec();
      expect(user).toBeNull();
    });

    it('should reject if no challenge exists for address', async () => {
      const isValid = await authService.verifySignature(
        'nonexistentAddress',
        testSignature,
        testChallenge,
      );

      expect(isValid).toBe(false);
    });

    it("should reject if message doesn't match challenge", async () => {
      const isValid = await authService.verifySignature(
        testAddress,
        testSignature,
        'wrongMessage',
      );

      expect(isValid).toBe(false);
    });

    it('should handle signature verification errors gracefully', async () => {
      (verifyPersonalMessageSignature as jest.Mock).mockRejectedValue(
        new Error('Verification failed'),
      );

      const isValid = await authService.verifySignature(
        testAddress,
        testSignature,
        testChallenge,
      );

      expect(isValid).toBe(false);
    });
  });

  describe('Token Generation', () => {
    it('should generate a valid JWT token', async () => {
      const testAddress = '0x1234567890abcdef';
      const token = await authService.generateToken(testAddress);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwtService.verify(token);
      expect(decoded.sub).toBe(testAddress);
    });
  });

  describe('Controller Endpoints', () => {
    const testAddress = '0x1234567890abcdef';
    const testSignature = 'testSignature';
    let testChallenge: string;

    beforeEach(async () => {
      const result = await authService.generateChallenge(testAddress);
      testChallenge = result.challenge;

      (verifyPersonalMessageSignature as jest.Mock).mockResolvedValue(true);
    });

    it('POST /auth/challenge should return challenge', async () => {
      const result = await authController.getChallenge({
        address: testAddress,
      });

      expect(result).toHaveProperty('challenge');
      expect(result).toHaveProperty('nonce');
      expect(result.challenge).toContain(result.nonce);
    });

    it('POST /auth/verify should return token for valid signature', async () => {
      const result = await authController.verifySignature({
        address: testAddress,
        signature: testSignature,
        message: testChallenge,
      });

      expect(result).toHaveProperty('accessToken');
      expect(typeof result.accessToken).toBe('string');
    });

    it('POST /auth/verify should throw for invalid signature', async () => {
      (verifyPersonalMessageSignature as jest.Mock).mockResolvedValue(false);

      await expect(
        authController.verifySignature({
          address: testAddress,
          signature: 'invalidSignature',
          message: testChallenge,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('JWT Strategy', () => {
    let jwtStrategy: JwtStrategy;

    beforeAll(() => {
      jwtStrategy = new JwtStrategy(new ConfigService(), userModel);
    });

    it('should validate user with valid token', async () => {
      const testAddress = '0x1234567890abcdef';
      await userModel.create({ walletAddress: testAddress });

      const payload = { sub: testAddress };
      const user = await jwtStrategy.validate(payload);

      expect(user).toBeDefined();
      expect(user.walletAddress).toBe(testAddress);
    });

    it('should throw for non-existent user', async () => {
      const payload = { sub: 'nonexistentAddress' };
      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
