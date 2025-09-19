import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  InternalServerErrorException,
  Param,
  Post,
} from '@nestjs/common';
import { Permissions } from '@core/auth/decorators/permissions.decorator';
import { CreateEmployeeDto } from '@core/users/dtos/create-employee.dto';
import { HTTPResponse } from 'src/shared/http/response';
import { CreateEmployeeUseCase } from '../use-cases/create-employee.usecase';
import { FindOneEmployeeUseCase } from '@core/users/use-cases/find-one-employee.usecase';
import { AssignGroupsToEmployeeDto } from '../dtos/assign-groups-to-employee.dto';
import { AssignGroupsToEmployeeUseCase } from '../use-cases/assign-groups-to-employee.usecase';
import { RemoveGroupsFromEmployeeUseCase } from '../use-cases/remove-groups-from-employee.usecase';

@Controller('business')
export class BusinessEmployeesController {
  constructor(
    private readonly createEmployeeUseCase: CreateEmployeeUseCase,
    private readonly findOneEmployeeUseCase: FindOneEmployeeUseCase,
    private readonly assignGroupsToEmployee: AssignGroupsToEmployeeUseCase,
    private readonly removeGroupsFromEmployee: RemoveGroupsFromEmployeeUseCase,
  ) {}

  @Post(':id/employees')
  @Permissions('users:create')
  public async createEmployee(
    @Param('id') businessId: string,
    @Body() data: CreateEmployeeDto,
  ) {
    try {
      await this.createEmployeeUseCase.execute(businessId, data);

      return HTTPResponse.created(null);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Get(':id/employees/:employeeId')
  @Permissions('users:read')
  public async findOneEmployee(
    @Param('id') businessId: string,
    @Param('employeeId') employeeId: string,
  ) {
    try {
      const res = await this.findOneEmployeeUseCase.execute(
        businessId,
        employeeId,
      );
      return HTTPResponse.ok(res);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Post(':id/employees/:employeeId/groups')
  @Permissions('users:update')
  public async assingGroups(
    @Param('id') businessId: string,
    @Param('employeeId') employeeId: string,
    @Body() data: AssignGroupsToEmployeeDto,
  ) {
    try {
      await this.assignGroupsToEmployee.execute(businessId, employeeId, data);

      return HTTPResponse.ok(null);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Delete(':id/employees/:employeeId/groups')
  @Permissions('users:update')
  public async removeGroups(
    @Param('id') businessId: string,
    @Param('employeeId') employeeId: string,
    @Body() data: AssignGroupsToEmployeeDto,
  ) {
    try {
      await this.removeGroupsFromEmployee.execute(businessId, employeeId, data);

      return HTTPResponse.ok(null);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
