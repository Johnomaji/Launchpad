import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { IsLessThanOrEqual } from '@common/decorators/is-less-than-or-equal.decorator';

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


  @ApiProperty({
    description: 'Initial supply of coins',
    example: 1000000,
    minimum: 1,
    maximum: 18_400_000_000,
  })
  @IsInt()
  @Min(1)
  @Max(18_400_000_000)
  @IsLessThanOrEqual('totalCoins', {
    message: 'initialSupply must be less than or equal to totalCoins',
  })
  initialSupply: number;

  @ApiProperty({
	  description: 'Number of decimals (1-9)',
	  example: 6,
	  minimum: 1,
	  maximum: 9,
	})
	@IsInt({ message: 'Decimals must be an integer (1-9)' })
	@Min(1)
	@Max(9)
	decimals: number;

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
