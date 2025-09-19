import { Injectable } from '@nestjs/common';
import { AssignGroupsToEmployeeDto } from '../dtos/assign-groups-to-employee.dto';
import { EmployeesQueriesRepository } from '../repositories/employees-queries.repository';
import { EmployeesCommandsRepository } from '../repositories/employees-commands.repository';
import { GroupsQueriesRepository } from '../repositories/groups-queries.repository';
import { GroupNotFoundException } from '../exceptions/group-not-found.exception';
import { EmployeeNotFoundException } from '../exceptions/employee-not-found.exception';
import { InsertEmployee } from '@repo/db';

@Injectable()
export class RemoveGroupsFromEmployeeUseCase {
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
      this.groupsQueriesRepository.findOne({
        businessId,
        groupId,
      }),
    );

    const groups = await Promise.all(findGroupsPromise);

    if (!groups.length) {
      throw new GroupNotFoundException('No se encontraron grupos');
    }

    const employeeInfo = await this.employeesQueriesRepository.findOne({
      businessId,
      userId: employeeId,
    });

    if (!employeeInfo) {
      throw new EmployeeNotFoundException();
    }

    const employeeToUpdate: InsertEmployee = {
      businessId,
      userId: employeeInfo.userId,
      groupIds: employeeInfo.groupIds.filter(
        (id) => !data.groupIds.includes(id),
      ),
    };

    await this.employeesCommandsReposotory.save(employeeToUpdate);
  }
}
