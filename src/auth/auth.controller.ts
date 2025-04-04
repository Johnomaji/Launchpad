import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsNotEmpty, IsString } from 'class-validator';

class ChallengeRequestDto {
  @IsString()
  @IsNotEmpty()
  address: string;
}

class VerifyRequestDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  signature: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('challenge')
  async getChallenge(@Body() body: ChallengeRequestDto) {
    return this.authService.generateChallenge(body.address);
  }

  @Post('verify')
  async verifySignature(@Body() body: VerifyRequestDto) {
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
}
