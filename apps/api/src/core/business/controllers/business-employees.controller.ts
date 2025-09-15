import {
  Body,
  Controller,
  HttpException,
  InternalServerErrorException,
  Param,
  Post,
} from '@nestjs/common';
import { Permissions } from '@core/auth/decorators/permissions.decorator';
import { CreateEmployeeDto } from '@core/users/dtos/create-employee.dto';
import { HTTPResponse } from 'src/shared/http/response';
import { CreateEmployeeUseCase } from '../use-cases/create-employee.usecase';

@Controller('business')
export class BusinessEmployeesController {
  constructor(private readonly createEmployeeUseCase: CreateEmployeeUseCase) {}

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
}
