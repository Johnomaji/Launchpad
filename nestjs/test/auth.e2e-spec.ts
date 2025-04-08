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
import { Challenge } from '@src/auth/schemas/challenge.schema';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let configService: ConfigService;
  const testAddress =
    '0x5fb156f9ebdcf2badf6aa77145c48665b758b5f142469e50c077157f1b5dc758';
  let challengeResponse: any;
  let userModel: Model<User>;
  let challengeModel: Model<Challenge>;
  let keypair: Ed25519Keypair;

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
    challengeModel = moduleFixture.get<Model<Challenge>>(
      getModelToken(Challenge.name),
    );
    // keypair = Ed25519Keypair.fromSecretKey(
    //   fromBase64(configService.get<string>('SUI_PRIVATE_KEY')).slice(1),
    // );
    keypair = new Ed25519Keypair();

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
        .send({ address: keypair.getPublicKey().toSuiAddress() });

      expect(challengeRes.statusCode).toBe(201);
      const { challenge } = challengeRes.body.data;

      const messageBytes = new TextEncoder().encode(challenge);
      const { signature } = await keypair.signPersonalMessage(messageBytes);
      // const signature = signatureBytes.signature;
      console.log(
        keypair.getPublicKey().toSuiAddress(),
        signature,
        messageBytes,
        challenge,
      );
      console.log(keypair.toSuiAddress());

      const response = await request(app.getHttpServer())
        .post('/auth/verify')
        .send({
          address: keypair.getPublicKey().toSuiAddress(),
          signature,
          message: challenge,
        })
        .expect(201);

      console.log('\n\n===\n', response.body);

      expect(response.body.data).toHaveProperty('accessToken');
      const payload = jwtService.verify(response.body.data.accessToken);
      expect(payload.sub).toBe(keypair.getPublicKey().toSuiAddress());
    });

    it('should create user if not exists', async () => {
      const newKeypair = new Ed25519Keypair();
      const newAddress = newKeypair.getPublicKey().toSuiAddress();

      const challengeRes = await request(app.getHttpServer())
        .post('/auth/challenge')
        .send({ address: newAddress });

      expect(challengeRes.statusCode).toBe(201);
      const { challenge } = challengeRes.body.data;

      const messageBytes = new TextEncoder().encode(challenge);
      const { signature } = await newKeypair.signPersonalMessage(messageBytes);

      const response = await request(app.getHttpServer())
        .post('/auth/verify')
        .send({
          address: newAddress,
          signature,
          message: challenge,
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('accessToken');

      const userModel = app.get('UserModel');
      const user = await userModel
        .findOne({ walletAddress: newAddress })
        .exec();

      expect(user).toBeTruthy();
      expect(user.walletAddress).toBe(newAddress);
    });

    it('should reject invalid signature', async () => {
      const challengeRes = await request(app.getHttpServer())
        .post('/auth/challenge')
        .send({ address: testAddress });

      expect(challengeRes.statusCode).toBe(201);
      const { challenge } = challengeRes.body.data;

      const invalidSignature = '0x12345678';

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
      const keypair = new Ed25519Keypair();
      const address = keypair.getPublicKey().toSuiAddress();

      const challengeRes = await request(app.getHttpServer())
        .post('/auth/challenge')
        .send({ address });

      expect(challengeRes.statusCode).toBe(201);

      const wrongMessage = 'This is not the challenge message';

      const wrongMessageBytes = new TextEncoder().encode(wrongMessage);
      const { signature } =
        await keypair.signPersonalMessage(wrongMessageBytes);

      const response = await request(app.getHttpServer())
        .post('/auth/verify')
        .send({
          address,
          signature,
          message: wrongMessage,
        })
        .expect(401);

      expect(response.body).toEqual({
        message: 'Invalid signature',
        path: '/auth/verify',
        statusCode: 401,
        timestamp: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
        ),
      });
    });

    it('should set a TTL index on expiresAt for 5 minutes', async () => {
      const indexes = await challengeModel.collection.indexes();

      const ttlIndex = indexes.find(
        (index) => index.expireAfterSeconds !== undefined,
      );

      expect(ttlIndex).toBeDefined();
      expect(ttlIndex.key).toEqual({ expiresAt: 1 });
      expect(ttlIndex.expireAfterSeconds).toBe(300);
    });

    it('should return existing user if already created', async () => {
      const keypair = new Ed25519Keypair();
      const address = keypair.getPublicKey().toSuiAddress();

      const userModel = app.get('UserModel');
      await userModel.create({
        walletAddress: address,
        username: 'testuser',
        createdAt: new Date(),
      });

      const challengeRes = await request(app.getHttpServer())
        .post('/auth/challenge')
        .send({ address });

      expect(challengeRes.statusCode).toBe(201);
      const { challenge } = challengeRes.body.data;

      // Sign and verify
      const messageBytes = new TextEncoder().encode(challenge);
      const { signature } = await keypair.signPersonalMessage(messageBytes);

      const response = await request(app.getHttpServer())
        .post('/auth/verify')
        .send({
          address,
          signature,
          message: challenge,
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('accessToken');

      const users = await userModel.find({ walletAddress: address }).exec();
      expect(users.length).toBe(1);
      expect(users[0].username).toBe('testuser');
    });
  });
  describe('Protected Routes', () => {
    let validToken: string;

    beforeEach(async () => {
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
