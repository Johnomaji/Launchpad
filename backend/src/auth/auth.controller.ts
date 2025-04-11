import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsNotEmpty, IsString } from 'class-validator';
import {
  ApiProperty,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { UserSchema, User } from '@users/schemas/users.schema';
import { User as UserDec } from '@users/users.decorator';
import { UserDto } from '@users/dto/user.dto';
import { JwtAuthGuard } from './jwt/jwt.guard';
import { IsSuiAddress } from '@common/decorators/is-sui-address.decorator';

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
  @IsNotEmpty()
  @IsSuiAddress()
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
  @ApiResponse({
    status: 201,
    description: 'Challenge message generated successfully',
    schema: {
      example: {
        challenge: 'Sign this message to authenticate: abc123nonce...',
      },
    },
  })
  async getChallenge(
    @Body() body: ChallengeRequestDto,
  ): Promise<{ challenge: string; nonce: string }> {
    return this.authService.generateChallenge(body.address);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify signature and issue JWT Bearer token' })
  @ApiResponse({
    status: 200,
    description: 'Signature is valid, JWT Bearer token returned',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid signature' })
  async verifySignature(@Body() body: VerifyRequestDto) {
    console.log('=====\n');
    console.log(body);

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
  @ApiOperation({
    summary: 'Return the current authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'The current authenticated user',
    schema: {
      $ref: getSchemaPath(UserDto),
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  whoAmI(@UserDec() user: User) {
    return user;
  }
}
