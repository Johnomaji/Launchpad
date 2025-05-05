import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '@mysten/sui/transactions';
import { PublishResult } from './publish-result-response.dto';

export class CoinCreation {
  @ApiProperty({
    description: 'The transaction object used for coin creation.',
    type: Transaction,
  })
  transaction: Transaction;

  @ApiProperty({
    description: 'Result of the publish operation including status and metadata.',
    type: PublishResult,
  })
  publishResult: PublishResult;

  @ApiProperty({
    description: 'The name of the coin being created.',
    example: 'MyToken',
  })
  coinName: string;

  @ApiProperty({
    description: 'The symbol or ticker for the coin.',
    example: 'MTK',
  })
  symbol: string;
}
