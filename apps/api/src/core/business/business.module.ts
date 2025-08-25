import { DbModule } from '@core/db/db.module';
import { Module } from '@nestjs/common';
import { BusinessCommandsRepository } from './repositories/business-commands.repository';
import { BusinessQueriesRepository } from './repositories/business-queries.repository';
import { CreateBusinessUseCase } from './use-cases/create-business.usecase';
import { BusinessController } from './controllers/business.controller';

@Module({
  imports: [DbModule],
  controllers: [BusinessController],
  providers: [
    CreateBusinessUseCase,
    BusinessCommandsRepository,
    BusinessQueriesRepository,
  ],
})
export class BusinessModule {}
