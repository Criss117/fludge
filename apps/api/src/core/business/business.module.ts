import { DbModule } from '@core/db/db.module';
import { Module } from '@nestjs/common';
import { UsersModule } from '@core/users/users.module';

import { BusinessCommandsRepository } from './repositories/business-commands.repository';
import { BusinessQueriesRepository } from './repositories/business-queries.repository';
import { CreateBusinessUseCase } from './use-cases/create-business.usecase';
import { BusinessController } from './controllers/business.controller';
import { FindOneBusinessUseCase } from './use-cases/find-one-business.usecase';
import { CreateEmployeeUseCase } from './use-cases/create-employee.usecase';
import { FindUserIsInUseCase } from './use-cases/find-user-is-in.usecase';
import { BusinessEmployeesController } from './controllers/business-employees.controller';
import { GroupsCommandsRepository } from './repositories/groups-commands.repository';
import { GroupsQueriesRepository } from './repositories/groups-queries.repository';
import { CreateGroupUseCase } from './use-cases/create-group.usecase';
import { BusinessGroupController } from './controllers/business-group.controller';
import { FindOneGroupUseCase } from './use-cases/find-one-group.usecase';
import { AssignEmployeesToGroupUseCase } from './use-cases/assign-employees-to-group.usecase';
import { UpdateGroupUseCase } from './use-cases/update-group.usecase';
import { EmployeesQueriesRepository } from './repositories/employees-queries.repository';
import { EmployeesCommandsRepository } from './repositories/employees-commands.repository';

@Module({
  imports: [DbModule, UsersModule],
  controllers: [
    BusinessController,
    BusinessEmployeesController,
    BusinessGroupController,
  ],
  providers: [
    CreateEmployeeUseCase,
    CreateBusinessUseCase,
    FindOneBusinessUseCase,
    FindUserIsInUseCase,
    CreateGroupUseCase,
    FindOneGroupUseCase,
    UpdateGroupUseCase,
    AssignEmployeesToGroupUseCase,

    BusinessCommandsRepository,
    BusinessQueriesRepository,
    GroupsCommandsRepository,
    GroupsQueriesRepository,
    EmployeesQueriesRepository,
    EmployeesCommandsRepository,
  ],
  exports: [FindUserIsInUseCase],
})
export class BusinessModule {}
