import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateMemecoinDto {
  @ApiProperty({ description: 'Name of the memecoin', example: 'DogeCoin' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Ticker symbol of the memecoin',
    example: 'DOGE',
  })
  @IsString()
  @IsNotEmpty()
  ticker: string;

  @ApiProperty({ description: 'URL of the memecoin image', required: false })
  @IsUrl()
  @IsOptional()
  image?: string;

  @ApiProperty({ description: 'Description of the memecoin', required: false })
  @IsString()
  @IsOptional()
  desc?: string;

  @ApiProperty({
    description: 'Total supply of coins',
    required: false,
    minimum: 1,
    maximum: 18_400_000_000,
    example: 1000000,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(18_400_000_000)
  totalCoins?: number;

  @ApiProperty({ description: 'X (Twitter) social link', required: false })
  @IsUrl()
  @IsOptional()
  xSocial?: string;

  @ApiProperty({ description: 'Telegram social link', required: false })
  @IsUrl()
  @IsOptional()
  telegramSocial?: string;

  @ApiProperty({ description: 'Discord social link', required: false })
  @IsUrl()
  @IsOptional()
  discordSocial?: string;
}
