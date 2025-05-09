import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
  ApiResponse,
} from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuthService } from './auth.service';
import { UserSchema, User } from '@users/schemas/users.schema';
import { User as UserDec } from '@users/users.decorator';
import { UserDto } from '@users/dto/user.dto';
import { JwtAuthGuard } from './jwt/jwt.guard';
import { IsSuiAddress } from '@common/decorators/is-sui-address.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class ChallengeRequestDto {
  @ApiProperty({
    description: 'Wallet address to request a challenge for signing',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsString()
  @IsSuiAddress()
  @IsNotEmpty()
  address: string;
}

export class VerifyRequestDto {
  @ApiProperty({
    description: 'Wallet address used to sign the message',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsString()
  @IsSuiAddress()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Signature generated from the challenge message',
    example: '0xabc123signature...',
  })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({
    description: 'The original challenge message that was signed',
    example: 'Sign this message: abc123nonce...',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('challenge')
  @ApiOperation({
    summary: 'Request a challenge message for signature verification',
  })
  @ApiOkResponse({
    description: 'Challenge message generated successfully',
    schema: {
      example: {
        success: true,
        data: {
          challenge: 'Sign this message to authenticate: abc123nonce...',
          nonce: 'abc123nonce...',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation error',
    schema: {
      example: {
        statusCode: 422,
        timestamp: '2025-05-04T12:34:56.789Z',
        path: '/auth/challenge',
        message: 'Validation failed (invalid address)',
      },
    },
  })
  async getChallenge(
    @Body() body: ChallengeRequestDto,
  ): Promise<{ challenge: string; nonce: string }> {
    const result = await this.authService.generateChallenge(body.address);
    return result;
  }

  @Post('verify')
  @ApiOperation({
    summary: 'Verify signature and issue JWT Bearer token',
  })
  @ApiOkResponse({
    description: 'JWT token issued successfully',
    schema: {
      example: {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input',
    schema: {
      example: {
        statusCode: 400,
        timestamp: '2025-05-04T12:34:56.789Z',
        path: '/auth/verify',
        message: 'Signature must be a valid string',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid signature',
    schema: {
      example: {
        statusCode: 401,
        timestamp: '2025-05-04T12:34:56.789Z',
        path: '/auth/verify',
        message: 'Invalid signature',
      },
    },
  })
  async verifySignature(
    @Body() body: VerifyRequestDto,
  ): Promise<{ accessToken: string }> {
    const isValid = await this.authService.verifySignature(
      body.address,
      body.signature,
      body.message,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    const accessToken = await this.authService.generateToken(body.address);
    return { accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Get('whoami')
  @ApiOperation({ summary: 'Return the current authenticated user' })
  @ApiOkResponse({
    description: 'Authenticated user returned',
    schema: {
      example: {
        success: true,
        data: {
          _id: 'user_id_here',
          username: 'memetic.eth',
          walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
          bio: 'Blockchain enthusiast and NFT collector',
          createdAt: '2023-04-01T12:00:00.000Z',
          updatedAt: '2023-04-02T15:30:00.000Z',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
    schema: {
      example: {
        statusCode: 401,
        timestamp: '2025-05-04T12:34:56.789Z',
        path: '/auth/whoami',
        message: 'Unauthorized',
      },
    },
  })
  whoAmI(@UserDec() user: User) {
    return user;
  }
}
