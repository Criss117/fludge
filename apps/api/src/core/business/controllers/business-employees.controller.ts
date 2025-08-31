import {
  Body,
  Controller,
  HttpException,
  InternalServerErrorException,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AssignEmployeeUseCase } from '../use-cases/assign-employee.usecase';
import { Permissions } from '@core/auth/decorators/permissions.decorator';
import { CreateEmployeeDto } from '@core/users/dtos/create-employee.dto';
import { HTTPResponse } from 'src/shared/http/response';
import { AssignEmployeeToGroupDto } from '@core/users/dtos/assign-employee-to-group.dto';
import { GetUser } from '@core/auth/decorators/get-user.decorator';
import { GetBusiness } from '../decorators/get-business.decorator';
import type { LogedUser } from '@repo/core/entities/user';
import type { BusinessDetail } from '@repo/core/entities/business';

@Controller('business')
export class BusinessEmployeesController {
  constructor(private readonly assignEmployeeUseCase: AssignEmployeeUseCase) {}

  @Post(':id/employees')
  @Permissions('users:create')
  public async createEmployee(
    @Param('id') id: string,
    @Body() data: CreateEmployeeDto,
  ) {
    try {
      await this.assignEmployeeUseCase.execute(data, id);

      return HTTPResponse.created(null);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Post(':id/employees/assign')
  @Permissions('users:update')
  public async assign(
    @Param('id') id: string,
    @Body() data: AssignEmployeeToGroupDto,
    @GetUser() user: LogedUser,
    @GetBusiness() business: BusinessDetail,
  ) {
    if (user.id === data.employeeId) {
      throw new UnauthorizedException('You are not allowed to do this');
    }

    if (!business.employees.some((e) => e.id === data.employeeId)) {
      throw new UnauthorizedException('The user is not in the business');
    }

    try {
      await this.assignEmployeeUseCase.onlyAssignEmployee(data, id);

      return HTTPResponse.created(null);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
