import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCoinDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  network?: string;
}
