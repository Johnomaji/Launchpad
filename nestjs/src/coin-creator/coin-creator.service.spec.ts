/**
 * @jest-environment jsdom
 */	
console.log(Object.keys(globalThis));
import { Test, TestingModule } from '@nestjs/testing';
import { CoinCreatorService } from './coin-creator.service';
import { ConfigService } from '@nestjs/config';
import { CreateCoinDto } from './dto/create-coin.dto';
import { SUI_NETWORKS } from './constants/sui.constants';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as toml from 'toml';

jest.mock('child_process');
jest.mock('fs');
jest.mock('path');
jest.mock('toml');
jest.mock('tomlify-j0.4', () => ({
  toToml: jest.fn().mockReturnValue('mocked toml content'),
}));
jest.mock('@mysten/sui/transactions');
jest.mock('@mysten/sui/client');
jest.mock('@mysten/sui/keypairs/ed25519');
jest.mock('@mysten/bcs', () => ({
  fromBase64: jest.fn().mockReturnValue(new Uint8Array([0, 1, 2, 3])),
}));

describe('CoinCreatorService', () => {
  let service: CoinCreatorService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key) => {
      if (key === 'sui.defaultGasBudget') return 10000;
      if (key === 'sui.privateKey') return 'mockBase64PrivateKey';
      return null;
    }),
  };

  const mockKeyPair = {
    getPublicKey: jest.fn().mockReturnValue({
      toSuiAddress: jest.fn().mockReturnValue('0xmockAddress'),
    }),
    signTransaction: jest.fn().mockResolvedValue({
      signature: 'mockSignature',
    }),
  };

  const mockTransaction = {
    publish: jest.fn().mockReturnValue('mockCap'),
    moveCall: jest.fn(),
    setSender: jest.fn(),
    setGasBudget: jest.fn(),
    build: jest.fn().mockResolvedValue('mockTransactionBytes'),
  };

  const mockClient = {
    executeTransactionBlock: jest.fn(),
  };

  const mockFsOperations = () => {
    (fs.readFileSync as jest.Mock).mockImplementation((path, encoding) => {
      if (path.includes('template.txt'))
        return 'template_description TEMPLATE Template template';
      if (path.includes('Move.toml')) return 'mock toml content';
      return '';
    });
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
    (fs.rmSync as jest.Mock).mockImplementation(() => {});
    (fs.renameSync as jest.Mock).mockImplementation(() => {});
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockFsOperations();

    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    (path.dirname as jest.Mock).mockImplementation((p) =>
      p.split('/').slice(0, -1).join('/'),
    );

    (execSync as jest.Mock).mockImplementation((cmd) => {
      if (cmd.includes('sui move build')) {
        return JSON.stringify({
          modules: ['mockModuleBase64'],
          dependencies: ['mockDependencyDigest'],
        });
      }
      return '';
    });

    (toml.parse as jest.Mock).mockReturnValue({ dependencies: {} });

    (Ed25519Keypair.fromSecretKey as jest.Mock).mockReturnValue(mockKeyPair);
    (Transaction as unknown as jest.Mock).mockImplementation(
      () => mockTransaction,
    );
    (SuiClient as jest.Mock).mockImplementation(() => mockClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoinCreatorService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CoinCreatorService>(CoinCreatorService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCoin', () => {
    const createCoinDto: CreateCoinDto = {
      name: 'Test Coin',
      symbol: 'TEST',
      iconUrl: 'https://example.com/icon.png',
      description: 'A test coin for testing purposes',
      network: 'testnet',
    };

    it('should create a coin successfully', async () => {
      mockClient.executeTransactionBlock.mockResolvedValueOnce({
        effects: {
          status: { status: 'success' },
          created: [
            {
              owner: 'Immutable',
              reference: { objectId: '0xmockPackageId' },
            },
          ],
        },
        digest: '0xmockTransactionDigest',
      });

      const result = await service.createCoin(createCoinDto);

      expect(result).toEqual({
        transaction: mockTransaction,
        publishResult: {
          success: true,
          packageId: '0xmockPackageId',
          transactionDigest: '0xmockTransactionDigest',
          response: expect.any(Object),
        },
        coinName: 'test_coin',
        symbol: 'TEST',
      });

      expect(execSync).toHaveBeenCalledWith('sui move new test_coin');
      expect(fs.writeFileSync).toHaveBeenCalledTimes(2); // Template and Move.toml
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('sui move build --dump-bytecode-as-base64'),
        expect.any(Object),
      );
      expect(mockTransaction.publish).toHaveBeenCalledWith({
        modules: ['mockModuleBase64'],
        dependencies: ['mockDependencyDigest'],
      });
      expect(mockTransaction.moveCall).toHaveBeenCalledWith({
        target: '0x2::package::make_immutable',
        arguments: ['mockCap'],
      });
      expect(mockClient.executeTransactionBlock).toHaveBeenCalled();
    });

    it('should throw error when required fields are missing', async () => {
      const invalidDto = { ...createCoinDto, name: undefined };
      await expect(service.createCoin(invalidDto as any)).rejects.toThrow(
        'Name, symbol, and description are required',
      );
    });

    it('should handle transaction failure', async () => {
      mockClient.executeTransactionBlock.mockResolvedValueOnce({
        effects: {
          status: { status: 'failure', error: 'Some error' },
        },
        digest: '0xmockTransactionDigest',
      });

      const result = await service.createCoin(createCoinDto);

      expect(result.publishResult.success).toBe(false);
      expect(result.publishResult.error).toEqual({
        status: 'failure',
        error: 'Some error',
      });
    });

    it('should throw error when network publishing fails', async () => {
      mockClient.executeTransactionBlock.mockRejectedValueOnce(
        new Error('Network error'),
      );

      await expect(service.createCoin(createCoinDto)).rejects.toThrow(
        'Network error',
      );
    });

    it('should use testnet by default when network is not specified', async () => {
      const dtoWithoutNetwork = { ...createCoinDto };
      delete dtoWithoutNetwork.network;

      mockClient.executeTransactionBlock.mockResolvedValueOnce({
        effects: {
          status: { status: 'success' },
          created: [
            {
              owner: 'Immutable',
              reference: { objectId: '0xmockPackageId' },
            },
          ],
        },
        digest: '0xmockTransactionDigest',
      });

      await service.createCoin(dtoWithoutNetwork);

      expect(SuiClient).toHaveBeenCalledWith({ url: SUI_NETWORKS.testnet });
    });

    it('should handle folder moving operations', async () => {
      mockClient.executeTransactionBlock.mockResolvedValueOnce({
        effects: {
          status: { status: 'success' },
          created: [
            {
              owner: 'Immutable',
              reference: { objectId: '0xmockPackageId' },
            },
          ],
        },
        digest: '0xmockTransactionDigest',
      });

      await service.createCoin(createCoinDto);

      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.renameSync).toHaveBeenCalled();
    });

    it('should throw error when folder moving fails', async () => {
      (fs.renameSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Move error');
      });

      await expect(service.createCoin(createCoinDto)).rejects.toThrow(
        'Move error',
      );
    });
  });

  describe('loadKeypairFromEnv', () => {
    it('should load keypair from environment variable', () => {
      const keypair = (service as any).loadKeypairFromEnv();
      expect(keypair).toBe(mockKeyPair);
    });

    it('should throw error when private key is not configured', () => {
      configService.get = jest.fn().mockReturnValue(null);
      expect(() => (service as any).loadKeypairFromEnv()).toThrow(
        'SUI_PRIVATE_KEY is not configured',
      );
    });
  });

  describe('publishToNetwork', () => {
    it('should publish to specified network', async () => {
      mockClient.executeTransactionBlock.mockResolvedValueOnce({
        effects: {
          status: { status: 'success' },
          created: [
            {
              owner: 'Immutable',
              reference: { objectId: '0xmockPackageId' },
            },
          ],
        },
        digest: '0xmockTransactionDigest',
      });

      const result = await (service as any).publishToNetwork(
        mockTransaction,
        mockKeyPair,
        'mainnet',
      );

      expect(SuiClient).toHaveBeenCalledWith({ url: SUI_NETWORKS.mainnet });
      expect(result.success).toBe(true);
      expect(result.packageId).toBe('0xmockPackageId');
    });

    it('should handle case when no package object is created', async () => {
      mockClient.executeTransactionBlock.mockResolvedValueOnce({
        effects: {
          status: { status: 'success' },
          created: [],
        },
        digest: '0xmockTransactionDigest',
      });

      const result = await (service as any).publishToNetwork(
        mockTransaction,
        mockKeyPair,
        'testnet',
      );

      expect(result.success).toBe(true);
      expect(result.packageId).toBeUndefined();
    });
  });
});
