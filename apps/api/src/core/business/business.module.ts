import { DbModule } from '@core/db/db.module';
import { Module } from '@nestjs/common';
import { BusinessCommandsRepository } from './repositories/business-commands.repository';
import { BusinessQueriesRepository } from './repositories/business-queries.repository';
import { CreateBusinessUseCase } from './use-cases/create-business.usecase';
import { BusinessController } from './controllers/business.controller';
import { FindOneBusinessUseCase } from './use-cases/find-one-business.usecase';
import { AssignEmployeeUseCase } from './use-cases/assign-employee.usecase';
import { UsersModule } from '@core/users/users.module';
import { FindUserIsInUseCase } from './use-cases/find-user-is-in.usecase';

@Module({
  imports: [DbModule, UsersModule],
  controllers: [BusinessController],
  providers: [
    AssignEmployeeUseCase,
    CreateBusinessUseCase,
    FindOneBusinessUseCase,
    AssignEmployeeUseCase,
    FindUserIsInUseCase,

    BusinessCommandsRepository,
    BusinessQueriesRepository,
  ],
  exports: [FindUserIsInUseCase],
})
export class BusinessModule {}
