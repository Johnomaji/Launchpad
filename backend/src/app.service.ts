import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getMemetic(): string {
    return 'Memetic Labs API';
  }
}
