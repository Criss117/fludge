import { Injectable } from '@nestjs/common';
import { AssignEmployeesToGroupDto } from '../dtos/assign-employees-to-group';
import { BusinessCommandsRepository } from '../repositories/business-commands.repository';

@Injectable()
export class AssignEmployeesToGroupUseCase {
  constructor(
    private readonly businessCommandsRepository: BusinessCommandsRepository,
  ) {}

  //TODO: validate if the business exists
  //TODO: validate if the group exists
  //TODO: validate if the employees exists
  //TODO: validate if the employees are in the business
  //TODO: validate if the employees are in the group
  public async execute(
    businessId: string,
    groupId: string,
    data: AssignEmployeesToGroupDto,
  ) {
    const assignEmployeesPromises = data.employeeIds.map((employeeId) =>
      this.businessCommandsRepository.assignEmployees(businessId, employeeId, [
        groupId,
      ]),
    );

    await Promise.all(assignEmployeesPromises);
  }
}
