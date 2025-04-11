import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as mongoose from 'mongoose';
import { HttpExceptionFilter } from '../src/common/filter/http-exception-filter/http-exception-filter.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform/transform.interceptor';
import * as compression from 'compression';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as morgan from 'morgan';

describe('AppModule (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    process.env.MONGODB_URI =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/memecoin-test';

    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(helmet());
    app.enableCors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    });
    app.use(morgan('dev'));
    app.use(compression());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    const config = new DocumentBuilder()
      .setTitle('Team Memetic Labs API')
      .setDescription('API for Memecoin builder application')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      jsonDocumentUrl: 'api-docs-json',
    });

    await app.init();
  }, 13000);

  afterAll(async () => {
    await mongoose.disconnect();
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('App Controller', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body.data).toContain('Memetic Labs API');
        });
    });
  });

  describe('API Documentation', () => {
    it('/api-docs (GET) - should serve Swagger documentation', () => {
      return request(app.getHttpServer())
        .get('/api-docs')
        .expect(200)
        .expect('Content-Type', /html/);
    });

    it('/api-docs-json (GET) - should serve Swagger JSON', () => {
      return request(app.getHttpServer())
        .get('/api-docs-json')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).toHaveProperty('info');
          expect(res.body.info.title).toBe('Team Memetic Labs API');
        });
    });
  });

  describe('Auth Module', () => {
    it('/auth/challenge (POST) - should validate request body', () => {
      return request(app.getHttpServer())
        .post('/auth/challenge')
        .send({})
        .expect(400);
    });
  });

  describe('Users Module', () => {
    it('/users (GET) - should require authentication', () => {
      return request(app.getHttpServer()).get('/users').expect(401);
    });
  });

  describe('Memecoins Module', () => {
    it('/memecoins (GET) - should return authentication', () => {
      return request(app.getHttpServer()).get('/memecoins').expect(401);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', () => {
      return request(app.getHttpServer())
        .get('/non-existent-route')
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 404);
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('path');
        });
    });
  });

  describe('Interceptors', () => {
    it('should transform successful responses with the TransformInterceptor', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
        });
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const endpoint = '/';
      const requests = Array(15).fill(null);

      for (const _ of requests) {
        const response = await request(app.getHttpServer()).get(endpoint);

        if (response.status === 429) {
          expect(response.status).toBe(429);
          expect(response.headers).toHaveProperty('retry-after');
          return;
        }
      }

      throw new Error('Rate limiting not properly enforced');
    }, 30000);
  });
});
