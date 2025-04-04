import { Test, TestingModule } from '@nestjs/testing';
import { MemecoinsController } from './memecoins.controller';
import { MemecoinsService } from './memecoins.service';

describe('MemecoinsController', () => {
  let controller: MemecoinsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemecoinsController],
      providers: [MemecoinsService],
    }).compile();

    controller = module.get<MemecoinsController>(MemecoinsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
