import { Injectable } from '@nestjs/common';
import { AssignEmployeesToGroupDto } from '../dtos/assign-employees-to-group.dto';
import { EmployeesQueriesRepository } from '../repositories/employees-queries.repository';
import { EmployeesCommandsRepository } from '../repositories/employees-commands.repository';
import { EmployeeNotFoundException } from '../exceptions/employee-not-found.exception';
import { InsertEmployeeDto } from '../repositories/dtos/insert-employee.dto';

@Injectable()
export class AssignEmployeesToGroupUseCase {
  constructor(
    private readonly employeesQueriesRepository: EmployeesQueriesRepository,
    private readonly employeesCommandsReposotory: EmployeesCommandsRepository,
  ) {}

  //TODO: validate if the business exists
  //TODO: validate if the group exists
  //TODO: validate if the employees are in the business
  //TODO: validate if the employees are in the group
  public async execute(
    businessId: string,
    groupId: string,
    data: AssignEmployeesToGroupDto,
  ) {
    const findEmployeesPromise = data.employeeIds.map((employeeId) =>
      this.employeesQueriesRepository.findOne(
        {
          businessId,
          userId: employeeId,
        },
        {
          ensureActive: true,
        },
      ),
    );

    const employees = await Promise.all(findEmployeesPromise);

    if (!employees.length) {
      throw new EmployeeNotFoundException();
    }

    const employeesToUpdate: InsertEmployeeDto[] = [];

    for (const employee of employees) {
      if (!employee) {
        throw new EmployeeNotFoundException();
      }

      employeesToUpdate.push({
        businessId,
        userId: employee.userId,
        groupIds: [...employee.groupIds, groupId],
      });
    }

    const assignEmployeesPromises = employeesToUpdate.map((employee) =>
      this.employeesCommandsReposotory.save(employee),
    );

    await Promise.all(assignEmployeesPromises);
  }
}
