import {
  Body,
  Controller,
  HttpException,
  InternalServerErrorException,
  Param,
  Post,
} from '@nestjs/common';
import { AssignEmployeeUseCase } from '../use-cases/assign-employee.usecase';
import { Permissions } from '@core/auth/decorators/permissions.decorator';
import { GetUser } from '@core/auth/decorators/get-user.decorator';
import { CreateEmployeeDto } from '@core/users/dtos/create-employee.dto';
import { HTTPResponse } from 'src/shared/http/response';
import type { LogedUser } from '@repo/core/entities/user';

@Controller('business')
export class BusinessEmployeesController {
  constructor(private readonly assignEmployeeUseCase: AssignEmployeeUseCase) {}

  @Post(':id/employees')
  @Permissions('users:create')
  public async createEmployee(
    @Param('id') id: string,
    @Body() data: CreateEmployeeDto,
    @GetUser() user: LogedUser,
  ) {
    try {
      await this.assignEmployeeUseCase.execute(data, user, id);

      return HTTPResponse.created(null);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
