import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Wallet address of the user',
    example: '0x1234abcd5678efgh9012ijkl3456mnop7890qrst',
  })
  @IsNotEmpty()
  @IsString()
  walletAddress: string;

  @ApiPropertyOptional({
    description: 'Optional username for the user',
    example: 'cryptoKing42',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'Optional bio for the user',
    example: 'NFT enthusiast and DeFi developer.',
  })
  @IsOptional()
  @IsString()
  bio?: string;
}
