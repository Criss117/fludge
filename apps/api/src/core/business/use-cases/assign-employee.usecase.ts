import { Inject, Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from '@core/users/dtos/create-employee.dto';
import { UserNoRootException } from '@core/users/exeptions/user-no-root.exeption';
import { BusinessQueriesRepository } from '../repositories/business-queries.repository';
import { BusinessCommandsRepository } from '../repositories/business-commands.repository';
import { CreateEmployeeUseCase } from '@core/users/use-cases/create-employee.usecase';
import { DBSERVICE, type LibSQLDatabase } from '@core/db/db.module';
import type { LogedUser } from '@repo/core/entities/user';

@Injectable()
export class AssignEmployeeUseCase {
  constructor(
    private readonly businessQueriesRepository: BusinessQueriesRepository,
    private readonly businessCommandsRepository: BusinessCommandsRepository,
    private readonly createEmployeeUseCase: CreateEmployeeUseCase,
    @Inject(DBSERVICE) private readonly db: LibSQLDatabase,
  ) {}

  //TODO: validate if the business exists
  //TODO: validate if the group exists
  public async execute(
    data: CreateEmployeeDto,
    rootUser: LogedUser,
    businessId: string,
  ) {
    //TODO: check if is necessary to check if the user is root
    if (!rootUser.isRoot) {
      throw new UserNoRootException();
    }

    await this.db.transaction(async (tx) => {
      const newUser = await this.createEmployeeUseCase.execute(data, { tx });

      await this.businessCommandsRepository.assignEmployee(
        businessId,
        newUser.id,
        data.groupId,
        {
          tx,
        },
      );
    });
  }
}
