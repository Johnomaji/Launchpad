import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { CoinCreatorModule } from '@coin-creator/coin-creator.module';
import { CoinCreatorService } from '@coin-creator/coin-creator.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CreateCoinDto } from '@coin-creator/dto/create-coin.dto';
import suiConfig from '@coin-creator/config/sui.config';
import { validate } from '@coin-creator/config/env.validation';
import * as fs from 'fs';
import * as path from 'path';

describe('CoinCreatorService (e2e)', () => {
  let app: INestApplication;
  let coinCreatorService: CoinCreatorService;
  let configService: ConfigService;

  const createCoinDto: CreateCoinDto = {
    name: 'Test Coin',
    symbol: 'TST',
    description: 'A test coin for e2e testing',
    iconUrl: 'https://example.com/test.png',
    network: 'testnet',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validate,
          load: [suiConfig],
        }),
        CoinCreatorModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    coinCreatorService =
      moduleFixture.get<CoinCreatorService>(CoinCreatorService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
    if (!process.env.SUI_PRIVATE_KEY) {
      throw new Error(
        'SUI_PRIVATE_KEY environment variable must be set for e2e tests',
      );
    }

    try {
      require('child_process').execSync('sui --version');
    } catch (e) {
      throw new Error(
        'sui CLI must be installed and available in PATH for e2e tests',
      );
    }
  });

  afterAll(async () => {
    await app.close();
    const sanitizedName = 'test_coin';
    const projectPath = path.join(process.cwd(), sanitizedName);
    const movedPath = path.join(
      path.dirname(process.cwd()),
      'move_module',
      sanitizedName,
    );

    if (fs.existsSync(projectPath)) {
      fs.rmSync(projectPath, { recursive: true, force: true });
    }
    if (fs.existsSync(movedPath)) {
      fs.rmSync(movedPath, { recursive: true, force: true });
    }
  });

  describe('createCoin', () => {
    it('should create a complete coin project and publish to network', async () => {
      const result = await coinCreatorService.createCoin(createCoinDto);

      const sanitizedName = 'test_coin';
      const movedPath = path.join(
        path.dirname(process.cwd()),
        'move_module',
        sanitizedName,
      );

      expect(fs.existsSync(movedPath)).toBeTruthy();
      expect(fs.existsSync(path.join(movedPath, 'sources'))).toBeTruthy();
      expect(fs.existsSync(path.join(movedPath, 'Move.toml'))).toBeTruthy();
      expect(
        fs.existsSync(path.join(movedPath, 'sources', `${sanitizedName}.move`)),
      ).toBeTruthy();

      expect(result.coinName).toBe(sanitizedName);
      expect(result.symbol).toBe('TST');
      expect(result.publishResult.success).toBe(true);
      expect(result.publishResult.packageId).toBeDefined();
      expect(result.publishResult.transactionDigest).toBeDefined();
    }, 30000);

    it('should fail with invalid coin name', async () => {
      const invalidDto = { ...createCoinDto, name: '' };
      await expect(coinCreatorService.createCoin(invalidDto)).rejects.toThrow(
        'Name, symbol, and description are required',
      );
    });
  });

  describe('configuration', () => {
    it('should have valid SUI configuration', () => {
      const privateKey = configService.get<string>('sui.privateKey');
      expect(privateKey).toBeDefined();
      expect(() => {
        Buffer.from(privateKey, 'base64');
      }).not.toThrow();

      const gasBudget = configService.get<number>('sui.defaultGasBudget');
      expect(gasBudget).toBeGreaterThan(0);
    });
  });
});

