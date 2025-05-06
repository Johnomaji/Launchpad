import { ApiProperty } from '@nestjs/swagger';
import { MemecoinDto } from './memecoins.dto';

export class MemecoinResponseDto {
  @ApiProperty({ default: true })
  success: boolean;

  @ApiProperty({ type: MemecoinDto })
  data: MemecoinDto;
}
