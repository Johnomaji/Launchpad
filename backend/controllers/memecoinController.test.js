const request = require('supertest');
const app = require('../app');

jest.mock('../models/Memecoin', () => {
  const originalModule = jest.requireActual('../models/Memecoin');
  return {
    ...originalModule,
    findOne: jest.fn(),
    prototype: {
      save: jest.fn()
    }
  };
});

jest.mock('../models/User', () => ({
  findOne: jest.fn()
}));

jest.mock('../utils/coinCreator', () => ({
  newCoin: jest.fn()
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
    // Mock User.findOne to return the mock user when creator address matches
    User.findOne.mockImplementation((query) => {
      if (query.walletAddress === validRequestBody.creator) {
        return Promise.resolve(mockUser);
      }
      return Promise.resolve(null);
    });

    // Mock Memecoin.findOne to return null (no existing memecoin)
    Memecoin.findOne.mockResolvedValue(null);
    
    // Mock successful coin deployment
    newCoin.mockResolvedValue(mockDeploymentResult);

    // Mock successful save
    Memecoin.prototype.save.mockResolvedValue({
      ...validRequestBody,
      ...mockDeploymentResult,
      _id: '507f1f77bcf86cd799439011'
    });

    const response = await request(app)
      .post('/api/v1/memecoins/create')
      .send(validRequestBody);

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

  it('should return 404 if user not found', async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/v1/memecoins/create')
      .send(validRequestBody);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });

  it('should return 400 if memecoin already exists', async () => {
    User.findOne.mockResolvedValue(mockUser);
    // Mock that a memecoin with this name already exists
    Memecoin.findOne.mockResolvedValue({ name: validRequestBody.name });

    const response = await request(app)
      .post('/api/v1/memecoins/create')
      .send(validRequestBody);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Memecoin already exists');
  });

  it('should return 500 if coin deployment fails', async () => {
    User.findOne.mockResolvedValue(mockUser);
    Memecoin.findOne.mockResolvedValue(null);

    // Mock failed coin deployment
    newCoin.mockRejectedValue(new Error('Deployment failed'));

    const response = await request(app)
      .post('/api/v1/memecoins/create')
      .send(validRequestBody);

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
    Memecoin.findOne.mockResolvedValue(null);
    newCoin.mockResolvedValue(mockDeploymentResult);
    
    // Mock failed save
    Memecoin.prototype.save.mockRejectedValue(new Error('Database save failed'));

    const response = await request(app)
      .post('/api/v1/memecoins/create')
      .send(validRequestBody);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Database save failed');
  });
});
