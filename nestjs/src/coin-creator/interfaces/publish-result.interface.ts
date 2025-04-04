import { SuiTransactionBlockResponse } from '@mysten/sui/client';

export interface PublishResult {
  success: boolean;
  packageId?: string;
  transactionDigest?: string;
  error?: any;
  response?: SuiTransactionBlockResponse;
}
