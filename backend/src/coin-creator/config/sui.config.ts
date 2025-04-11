// src/coin-creator/config/sui.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('sui', () => ({
  privateKey: process.env.SUI_PRIVATE_KEY,
  networks: {
    mainnet: 'https://fullnode.mainnet.sui.io:443',
    testnet: 'https://fullnode.testnet.sui.io:443',
    devnet: 'https://fullnode.devnet.sui.io:443',
  },
  defaultGasBudget: 30000000,
}));
