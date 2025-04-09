import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TransformInterceptor } from '@common/interceptors/transform/transform.interceptor';
import { HttpExceptionFilter } from '@common/filter/http-exception-filter/http-exception-filter.filter';
import { MemecoinsModule } from '@memecoins/memecoins.module';
import { User, UserSchema } from '@users/schemas/users.schema';
import { Model } from 'mongoose';
import { CreateMemecoinDto } from '@memecoins/dto/create-memecoin.dto';

describe('MemecoinsController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let userModel: Model<User>;
  let authToken: string;
  let testUser: User;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MemecoinsModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => {
            const privateKey = Buffer.from(
              configService.get<string>('JWT_PRIVATE_KEY_BASE64'),
              'base64',
            );
            const publicKey = Buffer.from(
              configService.get<string>('JWT_PUBLIC_KEY_BASE64'),
              'base64',
            );

            return {
              privateKey: {
                key: privateKey,
                passphrase: configService.get<string>('JWT_KEY_PASSPHRASE'),
              },
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
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    userModel = moduleFixture.get<Model<User>>('UserModel');

    // Create test user
    testUser = await userModel.create({
      username: 'testuser',
      walletAddress: '0x1234567890abcdef',
    });

    const jwtService = moduleFixture.get('JwtService');
    authToken = jwtService.sign({ userId: testUser._id.toString() });
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  beforeEach(async () => { });

  describe('POST /memecoins', () => {
    const validCreateDto: CreateMemecoinDto = {
      name: 'TestCoin',
      ticker: 'TST',
      desc: 'A test memecoin',
      image: 'https://example.com/image.png',
      totalCoins: 1000000,
      xSocial: 'https://x.com/testcoin',
      telegramSocial: 'https://t.me/testcoin',
      discordSocial: 'https://discord.gg/testcoin',
    };

    it('should create a new memecoin (201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/memecoins')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validCreateDto)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          publishResult: expect.any(Object),
          transactionDigest: expect.any(String),
        }),
      });

      const memecoinsResponse = await request(app.getHttpServer())
        .get('/memecoins')
        .expect(200);

      expect(memecoinsResponse.body.data).toHaveLength(1);
      expect(memecoinsResponse.body.data[0].name).toBe(validCreateDto.name);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/memecoins')
        .send(validCreateDto)
        .expect(401);
    });

    it('should return 400 when name is missing', async () => {
      const invalidDto = { ...validCreateDto, name: undefined };

      const response = await request(app.getHttpServer())
        .post('/memecoins')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toContain('name should not be empty');
    });

    it('should return 400 when ticker is missing', async () => {
      const invalidDto = { ...validCreateDto, ticker: undefined };

      const response = await request(app.getHttpServer())
        .post('/memecoins')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toContain('ticker should not be empty');
    });

    it('should return 400 when name already exists', async () => {
      await request(app.getHttpServer())
        .post('/memecoins')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validCreateDto);

      // Try to create again
      const response = await request(app.getHttpServer())
        .post('/memecoins')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validCreateDto)
        .expect(400);

      expect(response.body.message).toBe(
        'Memecoin with this name already exists',
      );
    });

    it('should return 400 when totalCoins is out of range', async () => {
      const invalidDto = { ...validCreateDto, totalCoins: 0 };

      const response = await request(app.getHttpServer())
        .post('/memecoins')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toContain(
        'totalCoins must not be less than 1',
      );
    });

    it('should return 400 when image URL is invalid', async () => {
      const invalidDto = { ...validCreateDto, image: 'not-a-url' };

      const response = await request(app.getHttpServer())
        .post('/memecoins')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toContain('image must be a URL address');
    });
  });

  describe('GET /memecoins', () => {
    it('should return all memecoins (200)', async () => {
      await request(app.getHttpServer())
        .post('/memecoins')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Coin1',
          ticker: 'C1',
          desc: 'Coin 1',
          image: 'https://example.com/coin1.png',
          totalCoins: 1000000,
        });

      await request(app.getHttpServer())
        .post('/memecoins')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Coin2',
          ticker: 'C2',
          desc: 'Coin 2',
          image: 'https://example.com/coin2.png',
          totalCoins: 2000000,
        });

      const response = await request(app.getHttpServer())
        .get('/memecoins')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ name: 'Coin1', ticker: 'C1' }),
          expect.objectContaining({ name: 'Coin2', ticker: 'C2' }),
        ]),
      });
    });

    it('should return empty array when no memecoins exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/memecoins')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [],
      });
    });
  });

  describe('GET /memecoins/:id', () => {
    it('should return a memecoin by ID (200)', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/memecoins')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'TestCoin',
          ticker: 'TST',
          desc: 'Test coin',
          image: 'https://example.com/test.png',
          totalCoins: 1000000,
        });

      const memecoinId = createResponse.body.data.publishResult.packageId;

      const response = await request(app.getHttpServer())
        .get(`/memecoins/${memecoinId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          name: 'TestCoin',
          ticker: 'TST',
        }),
      });
    });

    it('should return 401 when not authenticated', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/memecoins')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'TestCoin',
          ticker: 'TST',
          desc: 'Test coin',
          image: 'https://example.com/test.png',
          totalCoins: 1000000,
        });

      const memecoinId = createResponse.body.data.publishResult.packageId;

      await request(app.getHttpServer())
        .get(`/memecoins/${memecoinId}`)
        .expect(401);
    });

    it('should return 404 when memecoin not found', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      const response = await request(app.getHttpServer())
        .get(`/memecoins/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toBe(
        `Memecoin with ID ${nonExistentId} not found`,
      );
    });
  });

  describe('GET /memecoins/creator/:creatorId', () => {
    it('should return memecoins by creator (200)', async () => {
      await request(app.getHttpServer())
        .post('/memecoins')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'CreatorCoin1',
          ticker: 'CC1',
          desc: 'Creator Coin 1',
          image: 'https://example.com/creator1.png',
          totalCoins: 1000000,
        });

      await request(app.getHttpServer())
        .post('/memecoins')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'CreatorCoin2',
          ticker: 'CC2',
          desc: 'Creator Coin 2',
          image: 'https://example.com/creator2.png',
          totalCoins: 2000000,
        });

      const response = await request(app.getHttpServer())
        .get(`/memecoins/creator/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ name: 'CreatorCoin1' }),
          expect.objectContaining({ name: 'CreatorCoin2' }),
        ]),
      });
    });

    it('should return empty array when creator has no memecoins', async () => {
      const response = await request(app.getHttpServer())
        .get(`/memecoins/creator/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [],
      });
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get(`/memecoins/creator/${testUser._id}`)
        .expect(401);
    });
  });
});

