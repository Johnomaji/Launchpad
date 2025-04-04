const { validateCoinRequest } = require('./validateCoinRequest');
const httpMocks = require('node-mocks-http');

describe('validateCoinRequest Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });

  describe('Valid requests', () => {
    it('should call next() for a valid request with required fields', () => {
      req.body = {
        name: 'Bitcoin',
        ticker: 'BTC',
        creator: '0x1234567890abcdef',
        image: 'https://example.com/coin.png',
        desc: 'The first cryptocurrency',
        totalCoins: '21000000'
      };
      validateCoinRequest(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.statusCode).not.toBe(400);
    });

    it('should accept valid request with all fields including optional socials', () => {
      req.body = {
        name: 'Ethereum',
        ticker: 'ETH',
        creator: '0xabcdef1234567890',
        image: 'https://example.com/eth.png',
        desc: 'Smart contract platform',
        totalCoins: '1000000000',
        xSocial: 'ethereum',
        telegramSocial: 'ethereum_official',
        discordSocial: 'ethereum'
      };
      validateCoinRequest(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should accept valid sanitized names', () => {
      req.body = {
        name: 'My Coin 123',
        ticker: 'MC',
        creator: '0x123',
        image: 'https://example.com/image.png',
        desc: 'A test coin',
        totalCoins: '1000'
      };
      validateCoinRequest(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Invalid requests - required fields', () => {
    it('should reject missing name', () => {
      req.body = {
        ticker: 'BTC',
        creator: '0x123',
        image: 'https://example.com/image.png',
        desc: 'Description',
        totalCoins: '1000'
      };
      validateCoinRequest(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        success: false,
        error: 'Valid coin name is required'
      });
    });

    it('should reject missing ticker', () => {
      req.body = {
        name: 'Bitcoin',
        creator: '0x123',
        image: 'https://example.com/image.png',
        desc: 'Description',
        totalCoins: '1000'
      };
      validateCoinRequest(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        success: false,
        error: 'Valid coin ticker is required'
      });
    });

    it('should reject missing creator', () => {
      req.body = {
        name: 'Bitcoin',
        ticker: 'BTC',
        image: 'https://example.com/image.png',
        desc: 'Description',
        totalCoins: '1000'
      };
      validateCoinRequest(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        success: false,
        error: 'Valid creator wallet address is required'
      });
    });

    it('should reject missing description', () => {
      req.body = {
        name: 'Bitcoin',
        ticker: 'BTC',
        creator: '0x123',
        image: 'https://example.com/image.png',
        totalCoins: '1000'
      };
      validateCoinRequest(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        success: false,
        error: 'Valid coin description is required'
      });
    });

    it('should reject missing totalCoins', () => {
      req.body = {
        name: 'Bitcoin',
        ticker: 'BTC',
        creator: '0x123',
        image: 'https://example.com/image.png',
        desc: 'Description'
      };
      validateCoinRequest(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        success: false,
        error: 'Valid total coins amount is required (must be a positive number)'
      });
    });

    it('should reject invalid totalCoins (non-number)', () => {
      req.body = {
        name: 'Bitcoin',
        ticker: 'BTC',
        creator: '0x123',
        image: 'https://example.com/image.png',
        desc: 'Description',
        totalCoins: 'not-a-number'
      };
      validateCoinRequest(req, res, next);
      expect(res.statusCode).toBe(400);
    });

    it('should reject invalid totalCoins (negative number)', () => {
      req.body = {
        name: 'Bitcoin',
        ticker: 'BTC',
        creator: '0x123',
        image: 'https://example.com/image.png',
        desc: 'Description',
        totalCoins: '-1000'
      };
      validateCoinRequest(req, res, next);
      expect(res.statusCode).toBe(400);
    });

    it('should reject missing image URL', () => {
      req.body = {
        name: 'Bitcoin',
        ticker: 'BTC',
        creator: '0x123',
        desc: 'Description',
        totalCoins: '1000'
      };
      validateCoinRequest(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        success: false,
        error: 'Valid image URL is required'
      });
    });

    it('should reject invalid image URL', () => {
      req.body = {
        name: 'Bitcoin',
        ticker: 'BTC',
        creator: '0x123',
        image: 'not-a-url',
        desc: 'Description',
        totalCoins: '1000'
      };
      validateCoinRequest(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        success: false,
        error: 'Image must be a valid URL'
      });
    });
  });

  describe('Field format validation', () => {
    it('should reject name that is too short after sanitization', () => {
      req.body = {
        name: 'a',
        ticker: 'BTC',
        creator: '0x123',
        image: 'https://example.com/image.png',
        desc: 'Description',
        totalCoins: '1000'
      };
      validateCoinRequest(req, res, next);
      expect(res.statusCode).toBe(400);
    });

    it('should reject name that is too long after sanitization', () => {
      req.body = {
        name: 'ThisNameIsWayTooLongForTheValidationCriteriaWeHaveSet',
        ticker: 'BTC',
        creator: '0x123',
        image: 'https://example.com/image.png',
        desc: 'Description',
        totalCoins: '1000'
      };
      validateCoinRequest(req, res, next);
      expect(res.statusCode).toBe(400);
    });

    it('should reject names with invalid characters after sanitization', () => {
      req.body = {
        name: 'My$Coin',
        ticker: 'BTC',
        creator: '0x123',
        image: 'https://example.com/image.png',
        desc: 'Description',
        totalCoins: '1000'
      };
      validateCoinRequest(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        success: false,
        error: 'Coin name can only contain alphanumeric characters and underscores after sanitization'
      });
    });

    it('should reject ticker with invalid length', () => {
      req.body = {
        name: 'Bitcoin',
        ticker: '',
        creator: '0x123',
        image: 'https://example.com/image.png',
        desc: 'Description',
        totalCoins: '1000'
      };
      validateCoinRequest(req, res, next);
      expect(res.statusCode).toBe(400);
    });

    it('should reject ticker that is too long', () => {
      req.body = {
        name: 'Bitcoin',
        ticker: 'THISISTOOLONG',
        creator: '0x123',
        image: 'https://example.com/image.png',
        desc: 'Description',
        totalCoins: '1000'
      };
      validateCoinRequest(req, res, next);
      expect(res.statusCode).toBe(400);
    });
  });

  describe('Optional social media validation', () => {
    const baseValidRequest = {
      name: 'Bitcoin',
      ticker: 'BTC',
      creator: '0x123',
      image: 'https://example.com/image.png',
      desc: 'Description',
      totalCoins: '1000'
    };

    it('should accept valid optional socials', () => {
      req.body = {
        ...baseValidRequest,
        xSocial: 'bitcoin',
        telegramSocial: 'bitcoin_official',
        discordSocial: 'bitcoin'
      };
      validateCoinRequest(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid X social (empty string)', () => {
	  req.body = {
	    ...baseValidRequest,
	    xSocial: ''
	  };
	  validateCoinRequest(req, res, next);
	  expect(res.statusCode).toBe(400);
	  expect(res._getJSONData()).toEqual({
	    success: false,
	    error: 'If provided, X social must be a valid string'
	  });
	});

	it('should reject invalid X social (whitespace only)', () => {
	  req.body = {
	    ...baseValidRequest,
	    xSocial: '   '
	  };
	  validateCoinRequest(req, res, next);
	  expect(res.statusCode).toBe(400);
	});

	it('should accept undefined X social', () => {
	  req.body = {
	    ...baseValidRequest
	  };
	  validateCoinRequest(req, res, next);
	  expect(next).toHaveBeenCalled();
	});

	it('should accept null X social', () => {
	  req.body = {
	    ...baseValidRequest,
	    xSocial: null
	  };
	  validateCoinRequest(req, res, next);
	  expect(res.statusCode).toBe(400);

	});

    it('should reject invalid X social (empty string)', () => {
      req.body = {
        ...baseValidRequest,
        xSocial: ''
      };
      validateCoinRequest(req, res, next);
      expect(res.statusCode).toBe(400);
    });

    it('should reject invalid Telegram social (non-string)', () => {
      req.body = {
        ...baseValidRequest,
        telegramSocial: 123
      };
      validateCoinRequest(req, res, next);
      expect(res.statusCode).toBe(400);
    });

    it('should reject invalid Discord social (empty string)', () => {
      req.body = {
        ...baseValidRequest,
        discordSocial: ''
      };
      validateCoinRequest(req, res, next);
      expect(res.statusCode).toBe(400);
    });

    it('should accept request without any socials', () => {
      req.body = baseValidRequest;
      validateCoinRequest(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
