import {
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Param,
  Post,
} from '@nestjs/common';
import { CreateBusinessUseCase } from '../use-cases/create-business.usecase';
import { CreateBusinessDto } from '../dtos/create-business.dto';
import { GetUser } from '@core/auth/decorators/get-user.decorator';
import { UserNoRootException } from '@core/users/exeptions/user-no-root.exeption';
import { HTTPResponse } from 'src/shared/http/response';
import { FindOneBusinessUseCase } from '../use-cases/find-one-business.usecase';
import { CreateEmployeeDto } from '@core/users/dtos/create-employee.dto';
import { AssignEmployeeUseCase } from '../use-cases/assign-employee.usecase';
import type { LogedUser } from '@repo/core/entities/user';

@Controller('business')
export class BusinessController {
  constructor(
    private readonly createBusinessUseCase: CreateBusinessUseCase,
    private readonly findOneBusinessUseCase: FindOneBusinessUseCase,
    private readonly assignEmployeeUseCase: AssignEmployeeUseCase,
  ) {}

  @Post()
  public async create(
    @Body() data: CreateBusinessDto,
    @GetUser() user: LogedUser,
  ) {
    if (!user.isRoot) {
      throw new UserNoRootException();
    }

    try {
      const res = await this.createBusinessUseCase.execute(data, user.id);

      return HTTPResponse.created(res);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Get(':id')
  public async findOne(@Param('id') id: string, @GetUser() user: LogedUser) {
    try {
      const business = await this.findOneBusinessUseCase.execute(id, user.id);

      return HTTPResponse.ok(business);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Post(':id/employees')
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
