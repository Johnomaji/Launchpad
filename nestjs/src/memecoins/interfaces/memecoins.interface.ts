
import { CoinCreation } from '@coin-creator/interfaces/coin-creation.interface';
import { Types } from 'mongoose';

export interface IMemecoinCreation extends CoinCreation {
	_id: Types.ObjectId | string;
}
