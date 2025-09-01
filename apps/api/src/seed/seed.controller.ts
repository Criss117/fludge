import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ConfigService } from '@nestjs/config';
import { Public } from '@core/auth/decorators/public-route.decorator';
import { HTTPResponse } from 'src/shared/http/response';

@Controller('seed')
export class SeedController {
  constructor(
    private readonly configService: ConfigService,
    private readonly seedService: SeedService,
  ) {}

  @Get()
  @Public()
  public async seed() {
    const mode = this.configService.get('MODE', 'prod');

    if (mode !== 'dev') {
      return HTTPResponse.noContent();
    }

    try {
      await this.seedService.clearDB();
    } catch (error) {
      console.error(error);
    }

    await this.seedService.seed();

    return HTTPResponse.ok(null);
  }

  @Get('clear')
  @Public()
  public async clear() {
    await this.seedService.clearDB();
  }
}
