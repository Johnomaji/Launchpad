import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateMemecoinDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  ticker: string;

  @IsString()
  @IsNotEmpty()
  creator: string;

  @IsUrl()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  desc: string;

  @IsNumber()
  @IsNotEmpty()
  totalCoins: number;

  @IsString()
  @IsOptional()
  xSocial?: string;

  @IsString()
  @IsOptional()
  telegramSocial?: string;

  @IsString()
  @IsOptional()
  discordSocial?: string;
}
