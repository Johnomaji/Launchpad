const request = require('supertest');
const app = require('../app');

jest.mock('../models/Memecoin', () => ({
  findOne: jest.fn(),
  prototype: {
    save: jest.fn()
  }
}));

jest.mock('../models/User', () => ({
  findOne: jest.fn()
}));

jest.mock('../utils/coinCreator', () => ({
  newCoin: jest.fn()
}));

jest.mock('../models/Memecoin', () => ({
  findOne: jest.fn(),
  prototype: {
    save: jest.fn()
  }
}));

const Memecoin = require('../models/Memecoin');
const User = require('../models/User');
const { newCoin } = require('../utils/coinCreator');

describe('createMemecoin Controller', () => {
  let mockUser;
  let mockDeploymentResult;
  let validRequestBody;

  beforeEach(() => {
    mockUser = {
      walletAddress: '0x1234567890abcdef',
      username: 'testuser',
    };

    mockDeploymentResult = {
      publishResult: {
        packageId: '0x9876543210fedcba',
      },
    };

    validRequestBody = {
	  name: 'RecoCycle',
	  ticker: 'RCY',
	  creator: '0x4567890abcdef123',
	  image: 'https://example.io/ecocycle.png',
	  desc: 'A sustainable cryptocurrency for environmental conservation',
	  totalCoins: 2000000000,
	  xSocial: 'https://twitter.com/ecocyclecoin',
	  telegramSocial: 'https://t.me/ecocyclecoin',
	  discordSocial: 'https://discord.gg/ecocyclecoin',
    };

    jest.clearAllMocks();
  });

  it('should create a new memecoin successfully', async () => {
    User.findOne.mockResolvedValue(mockUser);

    Memecoin.findOne.mockResolvedValue(null);
    newCoin.mockResolvedValue(mockDeploymentResult);

    Memecoin.prototype.save.mockResolvedValue({
      ...validRequestBody,
      ...mockDeploymentResult,
      _id: '507f1f77bcf86cd799439011'
    });

    const response = await request(app)
      .post('/api/v1/memecoins/create')
      .send(validRequestBody);
	console.log(response);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Memecoin created successfully');
    expect(response.body.memecoin).toBeDefined();
    expect(newCoin).toHaveBeenCalledWith(
      validRequestBody.name,
      validRequestBody.ticker,
      validRequestBody.image,
      validRequestBody.desc,
      'testnet'
    );
  });

  it('should return 500 if user not found', async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/v1/memecoins/create')
      .send(validRequestBody);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('User not found');
  });

  it('should return 500 if memecoin already exists', async () => {
    User.findOne.mockImplementation((query) => {
      if (query.walletAddress === validRequestBody.creator) {
        return Promise.resolve(mockUser);
      }
      if (query.name === validRequestBody.name) {
        return Promise.resolve({ name: validRequestBody.name });
      }
      return Promise.resolve(null);
    });

    const response = await request(app)
      .post('/api/v1/memecoins/create')
      .send(validRequestBody);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Memecoin already exists');
  });

  it('should return 500 if coin deployment fails', async () => {
    User.findOne.mockResolvedValue(mockUser);
    
    newCoin.mockRejectedValue(new Error('Deployment failed'));

    const requestBody = {
      name: 'TwiCoin',
      ticker: 'TWI',
      creator: '0x1234567890fedcba',
      image: 'https://example.com/twi.png',
      desc: 'The next generation of meme coins',
      totalCoins: 10000000,
      xSocial: 'https://twitter.com/twi',
      telegramSocial: 'https://t.me/twi',
      discordSocial: 'https://discord.gg/twi',
    };

    const response = await request(app)
      .post('/api/v1/memecoins/create')
      .send(requestBody);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Deployment failed');
  });

  it('should validate required fields', async () => {
    const invalidRequestBody = { ...validRequestBody };
    delete invalidRequestBody.name;

    const response = await request(app)
      .post('/api/v1/memecoins/create')
      .send(invalidRequestBody);

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Valid coin name is required/i);
  });

  it('should handle database save errors', async () => {
    User.findOne.mockResolvedValue(mockUser);
    
    newCoin.mockResolvedValue(mockDeploymentResult);
    const mockSave = jest.fn().mockRejectedValue(new Error('Database save failed'));
    Memecoin.mockImplementationOnce(() => ({
      save: mockSave
    }));

    const requestBody = {
	  name: 'GalacticToken',
	  ticker: 'GALX',
	  creator: '0x9876543210abcdef',
	  image: 'https://example.net/galactic.png',
	  desc: 'A revolutionary cryptocurrency for space exploration',
	  totalCoins: 500000000,
	  xSocial: 'https://twitter.com/galactic_token',
	  telegramSocial: 'https://t.me/galactic_token',
	  discordSocial: 'https://discord.gg/galactic_token',
	};


    const response = await request(app)
      .post('/api/v1/memecoins/create')
      .send(requestBody);

	console.log(response)
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Database save failed');
  });
});
