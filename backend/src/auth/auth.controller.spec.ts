import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    generateChallenge: jest.fn(),
    verifySignature: jest.fn(),
    generateToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getChallenge', () => {
    it('should return challenge message when provided with a valid address', async () => {
      const address = '0x1234567890abcdef';
      const expectedChallenge = {
        message: 'Sign this message to authenticate: 123456',
      };

      mockAuthService.generateChallenge.mockResolvedValue(expectedChallenge);

      const result = await controller.getChallenge({ address });

      expect(authService.generateChallenge).toHaveBeenCalledWith(address);
      expect(result).toEqual(expectedChallenge);
    });

    it('should pass through any errors from the service', async () => {
      const address = '0x1234567890abcdef';
      const expectedError = new Error('Failed to generate challenge');

      mockAuthService.generateChallenge.mockRejectedValue(expectedError);

      await expect(controller.getChallenge({ address })).rejects.toThrow(
        expectedError,
      );
      expect(authService.generateChallenge).toHaveBeenCalledWith(address);
    });
  });

  describe('verifySignature', () => {
    const validRequest = {
      address: '0x1234567890abcdef',
      signature: '0xsignature',
      message: 'Sign this message to authenticate: 123456',
    };

    it('should return access token when signature is valid', async () => {
      const expectedToken = { accessToken: 'jwt.token.here' };

      mockAuthService.verifySignature.mockResolvedValue(true);
      mockAuthService.generateToken.mockResolvedValue(
        expectedToken.accessToken,
      );

      const result = await controller.verifySignature(validRequest);

      expect(authService.verifySignature).toHaveBeenCalledWith(
        validRequest.address,
        validRequest.signature,
        validRequest.message,
      );
      expect(authService.generateToken).toHaveBeenCalledWith(
        validRequest.address,
      );
      expect(result).toEqual(expectedToken);
    });

    it('should throw UnauthorizedException when signature is invalid', async () => {
      mockAuthService.verifySignature.mockResolvedValue(false);

      await expect(controller.verifySignature(validRequest)).rejects.toThrow(
        new UnauthorizedException('Invalid signature'),
      );

      expect(authService.verifySignature).toHaveBeenCalledWith(
        validRequest.address,
        validRequest.signature,
        validRequest.message,
      );
      expect(authService.generateToken).not.toHaveBeenCalled();
    });

    it('should pass through service errors during signature verification', async () => {
      const expectedError = new Error('Verification service unavailable');

      mockAuthService.verifySignature.mockRejectedValue(expectedError);

      await expect(controller.verifySignature(validRequest)).rejects.toThrow(
        expectedError,
      );

      expect(authService.verifySignature).toHaveBeenCalledWith(
        validRequest.address,
        validRequest.signature,
        validRequest.message,
      );
      expect(authService.generateToken).not.toHaveBeenCalled();
    });

    it('should pass through service errors during token generation', async () => {
      const expectedError = new Error('Token generation failed');

      mockAuthService.verifySignature.mockResolvedValue(true);
      mockAuthService.generateToken.mockRejectedValue(expectedError);

      await expect(controller.verifySignature(validRequest)).rejects.toThrow(
        expectedError,
      );

      expect(authService.verifySignature).toHaveBeenCalledWith(
        validRequest.address,
        validRequest.signature,
        validRequest.message,
      );
      expect(authService.generateToken).toHaveBeenCalledWith(
        validRequest.address,
      );
    });
  });
});
