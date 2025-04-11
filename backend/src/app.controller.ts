import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('App Controller')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Memetic Health Check' })
  @ApiResponse({ status: 200, description: 'Memetic Health response' })
  getMemetic(): string {
    return this.appService.getMemetic();
  }
}
