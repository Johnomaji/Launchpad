import { Controller } from '@nestjs/common';
import { MemecoinsService } from './memecoins.service';

@Controller('memecoins')
export class MemecoinsController {
  constructor(private readonly memecoinsService: MemecoinsService) {}
}
