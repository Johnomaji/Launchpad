import { Test, TestingModule } from '@nestjs/testing';
import { CoinCreatorController } from './coin-creator.controller';

describe('CoinCreatorController', () => {
  let controller: CoinCreatorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoinCreatorController],
    }).compile();

    controller = module.get<CoinCreatorController>(CoinCreatorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
