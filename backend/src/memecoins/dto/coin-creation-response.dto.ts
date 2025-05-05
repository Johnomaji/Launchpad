import { ApiProperty } from '@nestjs/swagger';
import { CoinCreation } from './coin-creation.dto';

export class CoinCreationResponseDto {
  @ApiProperty({
    description: 'Indicates whether the coin creation was successful.',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Detailed coin creation result data.',
    type: CoinCreation,
  })
  data: CoinCreation;
}
