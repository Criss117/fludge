import { Inject, Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from '@core/users/dtos/create-employee.dto';
import { CreateEmployeeUserUseCase } from '@core/users/use-cases/create-employee-user.usecase';
import { DBSERVICE, type LibSQLDatabase } from '@core/db/db.module';
import { BusinessQueriesRepository } from '../repositories/business-queries.repository';
import { BusinessNotFoundException } from '../exeptions/business-no-exists.exeption';
import { EmployeesQueriesRepository } from '../repositories/employees-queries.repository';

@Injectable()
export class CreateEmployeeUseCase {
  constructor(
    @Inject(DBSERVICE) private readonly db: LibSQLDatabase,
    private readonly createEmployeeUserUseCase: CreateEmployeeUserUseCase,
    private readonly businessQueriesRepository: BusinessQueriesRepository,
    private readonly employeesQueriesRepository: EmployeesQueriesRepository,
  ) {}

  //TODO: validate if the group exists
  public async execute(businessId: string, data: CreateEmployeeDto) {
    const existingBusiness = await this.businessQueriesRepository.findManyBy({
      id: businessId,
    });

    if (!existingBusiness.length) {
      throw new BusinessNotFoundException();
    }

    await this.db.transaction(async (tx) => {
      const newUser = await this.createEmployeeUserUseCase.execute(data, {
        tx,
      });

      await this.employeesQueriesRepository.save(
        {
          businessId,
          userId: newUser.id,
          groupIds: data.groupIds,
        },
        {
          tx,
        },
      );
    });
  }
}
