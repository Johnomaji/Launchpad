import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class MemecoinDto {
  @ApiProperty({ description: 'Unique identifier of the memecoin' })
  id: string;

  @ApiProperty({ description: 'Name of the memecoin', example: 'DogeCoin' })
  name: string;

  @ApiProperty({ description: 'Ticker symbol of the memecoin', example: 'DOGE' })
  ticker: string;

  @ApiProperty({ description: 'Blockchain address of the coin', example: '0x123...abc' })
  coinAddress: string;

  @ApiProperty({ description: 'ID of the creator user' })
  creator: string;

  @ApiProperty({ description: 'URL of the memecoin image', required: false })
  image: string;

  @ApiProperty({ description: 'Description of the memecoin', required: false })
  desc: string;

  @ApiProperty({ description: 'Total supply of coins', default: 0 })
  totalCoins: number;

  @ApiProperty({ description: 'X (Twitter) social link', required: false })
  xSocial: string;

  @ApiProperty({ description: 'Telegram social link', required: false })
  telegramSocial: string;

  @ApiProperty({ description: 'Discord social link', required: false })
  discordSocial: string;

  @ApiProperty({ description: 'Date of creation' })
  createdAt: Date;

  @ApiProperty({ description: 'Date of last update' })
  updatedAt: Date;
}
