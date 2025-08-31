import { Inject, Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from '@core/users/dtos/create-employee.dto';
import { BusinessQueriesRepository } from '../repositories/business-queries.repository';
import { BusinessCommandsRepository } from '../repositories/business-commands.repository';
import { CreateEmployeeUseCase } from '@core/users/use-cases/create-employee.usecase';
import { DBSERVICE, type LibSQLDatabase } from '@core/db/db.module';
import { AssignEmployeeToGroupDto } from '@core/users/dtos/assign-employee-to-group.dto';

@Injectable()
export class AssignEmployeeUseCase {
  constructor(
    @Inject(DBSERVICE) private readonly db: LibSQLDatabase,
    private readonly createEmployeeUseCase: CreateEmployeeUseCase,
    private readonly businessQueriesRepository: BusinessQueriesRepository,
    private readonly businessCommandsRepository: BusinessCommandsRepository,
  ) {}

  //TODO: validate if the business exists
  //TODO: validate if the group exists
  public async execute(data: CreateEmployeeDto, businessId: string) {
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

  public async onlyAssignEmployee(
    { employeeId, groupId }: AssignEmployeeToGroupDto,
    businessId: string,
  ) {
    await this.businessCommandsRepository.assignEmployee(
      businessId,
      employeeId,
      groupId,
    );
  }
}
