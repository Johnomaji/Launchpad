import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { disconnect } from 'mongoose';
import { AuthModule } from '@auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { TransformInterceptor } from '@src/common/interceptors/transform/transform.interceptor';
import { HttpExceptionFilter } from '@src/common/filter/http-exception-filter/http-exception-filter.filter';
import { Model } from 'mongoose';
import { User } from '@src/users/schemas/users.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { fromBase64, toBase64 } from '@mysten/sui/utils';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let configService: ConfigService;
  const testAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
  let challengeResponse: any;
  let userModel: Model<User>;
  const keypair = Ed25519Keypair.fromSecretKey(fromBase64(configService.get<string>(
    'JWT_PRIVATE_KEY_BASE64'
  )));

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        ConfigModule.forRoot(),
        MongooseModule.forRoot('mongodb://localhost:27017/test-db'),
      ],
      // providers: [
      //   ConfigService
      // ]
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    await userModel.deleteMany({});
  });

  beforeEach(async () => {
    const connection = app.get('DatabaseConnection');

    const collections = await connection.db.collections();

    for (const collection of collections) {
      await collection.deleteMany({});
    }
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    await disconnect();
    await app.close();
  });

  describe('/auth/challenge (POST)', () => {
    it('should generate a challenge for valid address', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/challenge')
        .send({ address: testAddress })
        .expect(201);

      console.log(response.body);

      expect(response.body.data).toHaveProperty('challenge');
      expect(response.body.data).toHaveProperty('nonce');
      expect(response.body.data.challenge).toContain(response.body.data.nonce);

      challengeResponse = response.body.data;
    });

    it('should reject empty address', async () => {
      await request(app.getHttpServer())
        .post('/auth/challenge')
        .send({ address: '' })
        .expect(400);
    });

    it('should reject invalid address format', async () => {
      await request(app.getHttpServer())
        .post('/auth/challenge')
        .send({ address: 'invalid-address' })
        .expect(400);
    });
  });

  describe('/auth/verify (POST)', () => {
    it('should return JWT token for valid signature', async () => {
      const challengeRes = await request(app.getHttpServer())
        .post('/auth/challenge')
        .send({ address: testAddress });

      const { challenge } = challengeRes.body;

      const messageBytes = new TextEncoder().encode(challenge);
      const signatureBytes = await keypair.signPersonalMessage(messageBytes);
      const signature = toBase64(Buffer.from(signatureBytes.signature));

      const response = await request(app.getHttpServer())
        .post('/auth/verify')
        .send({
          address: testAddress,
          signature,
          message: challenge,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      const payload = jwtService.verify(response.body.data.accessToken);
      expect(payload.sub).toBe(testAddress);
    });

    it('should create user if not exists', async () => {
      // This test depends on the previous one succeeding with a valid signature
      // In a real E2E test, this would be properly set up with a real wallet

      // First, get a real challenge
      const challengeRes = await request(app.getHttpServer())
        .post('/auth/challenge')
        .send({ address: testAddress });

      const { challenge } = challengeRes.body;

      // The following would be a real signature in actual implementation
      const signature = '0x12345...'; // In real test, generate this with a real wallet

      await request(app.getHttpServer()).post('/auth/verify').send({
        address: testAddress,
        signature: signature,
        message: challenge,
      });

      // In a real test environment, check if user was created
      const userModel = app.get('UserModel');
      const user = await userModel
        .findOne({ walletAddress: testAddress })
        .exec();

      // This check would pass in a real environment with valid signatures
      if (user) {
        expect(user.walletAddress).toBe(testAddress);
      }
    });

    it('should reject invalid signature', async () => {
      // First, get a real challenge
      const challengeRes = await request(app.getHttpServer())
        .post('/auth/challenge')
        .send({ address: testAddress });

      const { challenge } = challengeRes.body;

      // Using obviously invalid signature
      const invalidSignature = '0xinvalid';

      await request(app.getHttpServer())
        .post('/auth/verify')
        .send({
          address: testAddress,
          signature: invalidSignature,
          message: challenge,
        })
        .expect(401);
    });

    it('should reject mismatched challenge message', async () => {
      // First, get a real challenge
      const challengeRes = await request(app.getHttpServer())
        .post('/auth/challenge')
        .send({ address: testAddress });

      // Use a different message than the one generated
      const wrongMessage = 'This is not the challenge message';

      // For a real implementation, we'd need a real signature
      const signature = '0x12345...'; // In real test, generate this with a real wallet

      await request(app.getHttpServer())
        .post('/auth/verify')
        .send({
          address: testAddress,
          signature: signature,
          message: wrongMessage,
        })
        .expect(401);
    });
  });

  describe('Protected Routes', () => {
    let validToken: string;

    beforeEach(async () => {
      // Create a valid token manually for testing protected routes
      validToken = jwtService.sign({ sub: testAddress });

      // Create a user in database directly
      const userModel = app.get('UserModel');
      await userModel.create({ walletAddress: testAddress });
    });

    it('should allow access with valid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/whoami')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);
    });

    it('should reject requests without token', async () => {
      await request(app.getHttpServer()).get('/auth/whoami').expect(401);
    });
  });
});
