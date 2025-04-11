import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TransformInterceptor } from '@common/interceptors/transform/transform.interceptor';
import { HttpExceptionFilter } from '@common/filter/http-exception-filter/http-exception-filter.filter';
import { MemecoinsModule } from '@memecoins/memecoins.module';
import { User, UserSchema } from '@users/schemas/users.schema';
import { Memecoin, MemecoinSchema } from '@memecoins/schemas/memecoins.schema';
import { Model } from 'mongoose';
import { CreateMemecoinDto } from '@memecoins/dto/create-memecoin.dto';
import { AuthModule } from '@auth/auth.module';

describe('MemecoinsController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let userModel: Model<User>;
  let memecoinModel: Model<Memecoin>;
  let authToken: string;
  let testUser: User;

  jest.setTimeout(30_000);

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
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
          {
            name: Memecoin.name,
            schema: MemecoinSchema,
          },
        ]),
        MemecoinsModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    memecoinModel = moduleFixture.get<Model<Memecoin>>(
      getModelToken(Memecoin.name),
    );

    testUser = await userModel.create({
      username: 'testuser',
      walletAddress: '0x1234567890abcdef',
    });

    const jwtService = moduleFixture.get<JwtService>(JwtService);
    authToken = jwtService.sign({ sub: testUser.walletAddress });
  }, 30000);

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    await memecoinModel.deleteMany({});
  });

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
          coinName: expect.any(String),
          publishResult: expect.objectContaining({
            packageId: expect.any(String),
            response: expect.any(Object),
            success: expect.any(Boolean),
            transactionDigest: expect.any(String),
          }),
          symbol: expect.any(String),
          transaction: expect.any(Object),
        }),
      });

      const memecoinsResponse = await request(app.getHttpServer())
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            name: 'Coin2',
            ticker: 'C2',
            desc: 'Coin 2',
            image: 'https://example.com/coin2.png',
            creator: expect.objectContaining({
              _id: expect.any(String),
              walletAddress: testUser.walletAddress,
            }),
          }),
          expect.objectContaining({
            name: 'Coin1',
            ticker: 'C1',
            desc: 'Coin 1',
            image: 'https://example.com/coin1.png',
            creator: expect.objectContaining({
              _id: expect.any(String),
              walletAddress: testUser.walletAddress,
            }),
          }),
        ]),
      });
    });

    it('should return empty array when no memecoins exist', async () => {
      await memecoinModel.deleteMany({});
      const response = await request(app.getHttpServer())
        .get('/memecoins')
        .set('Authorization', `Bearer ${authToken}`)
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
          name: 'Trojan Coin',
          ticker: 'TRJ',
          desc: 'Trojan coin',
          image: 'https://example.com/trojan.png',
          totalCoins: 1000000,
        })
        .expect(201);

      console.log(createResponse.body);

      const memecoinId = createResponse.body.data._id;

      const response = await request(app.getHttpServer())
        .get(`/memecoins/${memecoinId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

      const { data } = response.body;
      expect(data.name).toBe('Trojan Coin');
      expect(data.ticker).toBe('TRJ');
      expect(data.desc).toBe('Trojan coin');
      expect(data.image).toBe('https://example.com/trojan.png');

      expect(data.creator).toBeDefined();
      expect(data.creator.username).toBe(testUser.username);
      expect(data.creator.walletAddress).toBe(testUser.walletAddress);
    });

    it('should return 401 when not authenticated', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/memecoins')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Osalobua',
          ticker: 'OSA',
          desc: 'Osalobua coin',
          image: 'https://example.com/test.png',
          totalCoins: 1000000,
        });

      const memecoinId = createResponse.body.data._id || '586f08533ab0e';

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
      console.log(response.body);

      expect(response.body.message).toBe(
        `Memecoin with ID ${nonExistentId} not found`,
      );
    });
  });

  describe('GET /memecoins/creator/', () => {
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
        .get(`/memecoins/creator/`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      console.log(response.body);
      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            name: 'CreatorCoin1',
            desc: 'Creator Coin 1',
            ticker: 'CC1',
            image: 'https://example.com/creator1.png',
            creator: expect.objectContaining({
              username: 'testuser',
            }),
          }),
          expect.objectContaining({
            name: 'CreatorCoin2',
            desc: 'Creator Coin 2',
            ticker: 'CC2',
            image: 'https://example.com/creator2.png',
            creator: expect.objectContaining({
              username: 'testuser',
            }),
          }),
        ]),
      });
    });

    it('should return empty array when creator has no memecoins', async () => {
      // await memecoinModel.deleteMany({creator: testUser._id });

      const response = await request(app.getHttpServer())
        .get(`/memecoins/creator/`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      console.log(response.body);
      expect(response.body).toEqual({
        success: true,
        data: [],
      });
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer()).get(`/memecoins/creator`).expect(401);
    });
  });
});
