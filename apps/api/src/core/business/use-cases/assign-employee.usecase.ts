import { Inject, Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from '@core/users/dtos/create-employee.dto';
import { BusinessCommandsRepository } from '../repositories/business-commands.repository';
import { CreateEmployeeUseCase } from '@core/users/use-cases/create-employee.usecase';
import { DBSERVICE, type LibSQLDatabase } from '@core/db/db.module';

@Injectable()
export class AssignEmployeeUseCase {
  constructor(
    @Inject(DBSERVICE) private readonly db: LibSQLDatabase,
    private readonly createEmployeeUseCase: CreateEmployeeUseCase,
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
}
