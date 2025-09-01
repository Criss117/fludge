import { Module } from '@nestjs/common';
import { DbModule } from './core/db/db.module';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './core/health/health.module';
import { LoggerModule } from './shared/logger/logger.module';
import { UsersModule } from './core/users/users.module';
import { AuthModule } from './core/auth/auth.module';
import { BusinessModule } from './core/business/business.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    DbModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    LoggerModule,
    UsersModule,
    AuthModule,
    BusinessModule,
    SeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
