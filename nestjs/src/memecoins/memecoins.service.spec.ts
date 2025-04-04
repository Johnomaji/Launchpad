import { Test, TestingModule } from '@nestjs/testing';
import { MemecoinsService } from './memecoins.service';

describe('MemecoinsService', () => {
  let service: MemecoinsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemecoinsService],
    }).compile();

    service = module.get<MemecoinsService>(MemecoinsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
