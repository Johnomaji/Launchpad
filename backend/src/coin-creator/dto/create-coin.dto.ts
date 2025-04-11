import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCoinDto {
  @ApiProperty({
    description: 'Name of the coin',
    example: 'MyCoin',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Symbol or ticker of the coin',
    example: 'MYC',
  })
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiPropertyOptional({
    description: 'URL to the coin icon/image',
    example: 'https://example.com/icons/mycoin.png',
  })
  @IsString()
  @IsOptional()
  iconUrl?: string;

  @ApiProperty({
    description: 'A brief description of the coin',
    example: 'A community-driven meme coin with zero utility.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'SUI network the coin is deployed on',
    example: 'Testnet',
  })
  @IsString()
  @IsOptional()
  network?: string;
}
