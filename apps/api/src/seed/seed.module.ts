import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { DbModule } from '@core/db/db.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [DbModule, ConfigModule],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
