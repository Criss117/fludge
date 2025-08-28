import { Public } from '@core/auth/decorators/public-route.decorator';
import { Controller, Get } from '@nestjs/common';
import { HTTPResponse } from 'src/shared/http/response';

@Controller('health')
export class HealthController {
  @Get()
  @Public()
  getHello() {
    return HTTPResponse.ok(null);
  }
}
