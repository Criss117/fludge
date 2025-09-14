import { Permissions } from '@core/auth/decorators/permissions.decorator';
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
import { CreateGroupDto } from '../dtos/create-group.dto';
import { CreateGroupUseCase } from '../use-cases/create-group.usecase';
import { HTTPResponse } from 'src/shared/http/response';
import { FindOneGroupUseCase } from '../use-cases/find-one-group.usecase';
import { AssignEmployeesToGroupUseCase } from '../use-cases/assign-employees-to-group.usecase';
import { AssignEmployeesToGroupDto } from '../dtos/assign-employees-to-group';

@Controller('business')
export class BusinessGroupController {
  constructor(
    private readonly createGroupUseCase: CreateGroupUseCase,
    private readonly findOneGroupUseCase: FindOneGroupUseCase,
    private readonly assignEmployeesToGroupUseCase: AssignEmployeesToGroupUseCase,
  ) {}

  @Post(':id/groups')
  @Permissions('groups:create')
  public async create(@Param('id') id: string, @Body() data: CreateGroupDto) {
    try {
      await this.createGroupUseCase.execute(id, data);

      return HTTPResponse.created(null);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went grong');
    }
  }

  @Get(':id/groups/:groupId')
  @Permissions('groups:read')
  public async findOne(
    @Param('id') id: string,
    @Param('groupId') groupId: string,
  ) {
    try {
      return HTTPResponse.ok(
        await this.findOneGroupUseCase.execute(id, groupId),
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went grong');
    }
  }

  @Post(':id/groups/:groupId/employees')
  @Permissions('groups:read', 'groups:update')
  public async assignEmployees(
    @Param('id') businessId: string,
    @Param('groupId') groupId: string,
    @Body() data: AssignEmployeesToGroupDto,
  ) {
    try {
      return HTTPResponse.ok(
        await this.assignEmployeesToGroupUseCase.execute(
          businessId,
          groupId,
          data,
        ),
      );
    } catch (error) {
      console.log(error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went grong');
    }
  }

  @Delete(':id/groups/:groupId/employees')
  @Permissions('groups:read', 'groups:update')
  public async deleteEmployees(
    @Param('id') businessId: string,
    @Param('groupId') groupId: string,
    @Body() data: AssignEmployeesToGroupDto,
  ) {
    try {
      return HTTPResponse.ok(
        await this.assignEmployeesToGroupUseCase.execute(
          businessId,
          groupId,
          data,
        ),
      );
    } catch (error) {
      console.log(error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went grong');
    }
  }
}
