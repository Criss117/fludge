import {
  Body,
  Controller,
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

@Controller('business')
export class BusinessEmployeesController {
  constructor(
    private readonly createEmployeeUseCase: CreateEmployeeUseCase,
    private readonly findOneEmployeeUseCase: FindOneEmployeeUseCase,
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
  public async getEmployees(
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
}
