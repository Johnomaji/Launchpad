import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
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

  @ApiProperty({ description: 'Ticker symbol of the memecoin', example: 'DOGE' })
  @IsString()
  @IsNotEmpty()
  ticker: string;

  @ApiProperty({ description: 'URL of the memecoin image', example: 'https://example.com/image.png' })
  @IsUrl()
  @IsNotEmpty()
  image: string;

  @ApiProperty({ description: 'Description of the memecoin', example: 'A fun coin based on Doge meme.' })
  @IsString()
  @IsNotEmpty()
  desc: string;

  @ApiProperty({
    description: 'Total supply of coins',
    example: 1000000,
    minimum: 1,
    maximum: 18_400_000_000,
  })
  @IsInt()
  @Min(1)
  @Max(18_400_000_000)
  totalCoins: number;

  @ApiProperty({ description: 'X (Twitter) social link', example: 'https://x.com/dogecoin' })
  @IsUrl()
  @IsNotEmpty()
  xSocial: string;

  @ApiProperty({ description: 'Telegram social link', example: 'https://t.me/dogecoin' })
  @IsUrl()
  @IsNotEmpty()
  telegramSocial: string;

  @ApiProperty({ description: 'Discord social link', example: 'https://discord.gg/dogecoin' })
  @IsUrl()
  @IsNotEmpty()
  discordSocial: string;
}
