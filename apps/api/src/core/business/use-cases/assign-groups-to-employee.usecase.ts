import { Injectable } from '@nestjs/common';
import { EmployeesQueriesRepository } from '../repositories/employees-queries.repository';
import { EmployeesCommandsRepository } from '../repositories/employees-commands.repository';
import { AssignGroupsToEmployeeDto } from '../dtos/assign-groups-to-employee.dto';
import { GroupsQueriesRepository } from '../repositories/groups-queries.repository';
import { EmployeeNotFoundException } from '../exceptions/employee-not-found.exception';

@Injectable()
export class AssignGroupsToEmployeeUseCase {
  constructor(
    private readonly employeesQueriesRepository: EmployeesQueriesRepository,
    private readonly employeesCommandsReposotory: EmployeesCommandsRepository,
    private readonly groupsQueriesRepository: GroupsQueriesRepository,
  ) {}

  public async execute(
    businessId: string,
    employeeId: string,
    data: AssignGroupsToEmployeeDto,
  ) {
    const findGroupsPromise = data.groupIds.map((groupId) =>
      this.groupsQueriesRepository.findOne(
        {
          businessId,
          groupId,
        },
        {
          ensureActive: true,
        },
      ),
    );

    const groups = await Promise.all(findGroupsPromise);

    if (!groups.length) {
      throw new Error('No se encontraron grupos');
    }

    const employeeInfo = await this.employeesQueriesRepository.findOne(
      {
        businessId,
        userId: employeeId,
      },
      {
        ensureActive: true,
      },
    );

    if (!employeeInfo) {
      throw new EmployeeNotFoundException();
    }

    await this.employeesCommandsReposotory.save({
      businessId,
      userId: employeeId,
      groupIds: [...employeeInfo.groupIds, ...data.groupIds],
    });
  }
}
