import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { CreateRootUserUseCase } from './use-cases/create-root-user.usecase';
import { UsersCommandsRepository } from './repositories/users-commands.repository';
import { UsersQueriesRepository } from './repositories/users-queries.repository';
import { FindOneUserByUseCase } from './use-cases/find-one-user-by.usecase';
import { CreateEmployeeUserUseCase } from './use-cases/create-employee-user.usecase';

@Module({
  imports: [DbModule],
  providers: [
    FindOneUserByUseCase,
    CreateRootUserUseCase,
    CreateEmployeeUserUseCase,
    UsersCommandsRepository,
    UsersQueriesRepository,
  ],
  exports: [
    CreateRootUserUseCase,
    FindOneUserByUseCase,
    CreateEmployeeUserUseCase,
  ],
})
export class UsersModule {}
