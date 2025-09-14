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
import { BusinessEmployeesController } from './controllers/business-employees.controller';
import { GroupsCommandsRepository } from './repositories/groups-commands.repository';
import { GroupsQueriesRepository } from './repositories/groups-queries.repository';
import { CreateGroupUseCase } from './use-cases/create-group.usecase';
import { BusinessGroupController } from './controllers/business-group.controller';
import { FindOneGroupUseCase } from './use-cases/find-one-group.usecase';
import { AssignEmployeesToGroupUseCase } from './use-cases/assign-employees-to-group.usecase';
import { UpdateGroupUseCase } from './use-cases/update-group.usecase';

@Module({
  imports: [DbModule, UsersModule],
  controllers: [
    BusinessController,
    BusinessEmployeesController,
    BusinessGroupController,
  ],
  providers: [
    AssignEmployeeUseCase,
    CreateBusinessUseCase,
    FindOneBusinessUseCase,
    AssignEmployeeUseCase,
    FindUserIsInUseCase,
    CreateGroupUseCase,
    FindOneGroupUseCase,
    UpdateGroupUseCase,

    BusinessCommandsRepository,
    BusinessQueriesRepository,
    GroupsCommandsRepository,
    GroupsQueriesRepository,
    AssignEmployeesToGroupUseCase,
  ],
  exports: [FindUserIsInUseCase],
})
export class BusinessModule {}
