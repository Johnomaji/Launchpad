import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SuiTransactionBlockResponse } from '@mysten/sui/client';

export class PublishResult {
  @ApiProperty({
    description: 'Indicates whether the publish operation was successful.',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'The ID of the published package.',
    example: '0xabc123...',
  })
  packageId?: string;

  @ApiPropertyOptional({
    description: 'The transaction digest of the publish operation.',
    example: '2FhX...z89G',
  })
  transactionDigest?: string;

  @ApiPropertyOptional({
    description: 'Error object if the publish operation failed.',
    type: Object,
  })
  error?: any;

  @ApiPropertyOptional({
    description: 'The full response from the Sui transaction block.',
    type: Object,
  })
  response?: SuiTransactionBlockResponse;
}
