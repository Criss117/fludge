import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { DbModule } from '@core/db/db.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'src/shared/logger/logger.module';

@Module({
  imports: [DbModule, ConfigModule, LoggerModule],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
