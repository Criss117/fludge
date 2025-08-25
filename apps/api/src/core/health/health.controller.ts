import { Controller, Get } from '@nestjs/common';
import { HTTPResponse } from 'src/shared/http/response';

@Controller('health')
export class HealthController {
  @Get()
  getHello() {
    return HTTPResponse.ok(null);
  }
}
