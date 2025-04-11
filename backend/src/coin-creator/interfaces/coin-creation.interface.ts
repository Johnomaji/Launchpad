import { Transaction } from '@mysten/sui/transactions';
import { PublishResult } from './publish-result.interface';

export interface CoinCreation {
  transaction: Transaction;
  publishResult: PublishResult;
  coinName: string;
  symbol: string;
}
