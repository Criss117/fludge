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
  Patch,
} from '@nestjs/common';
import { CreateGroupDto } from '../dtos/create-group.dto';
import { CreateGroupUseCase } from '../use-cases/create-group.usecase';
import { HTTPResponse } from 'src/shared/http/response';
import { FindOneGroupUseCase } from '../use-cases/find-one-group.usecase';
import { AssignEmployeesToGroupUseCase } from '../use-cases/assign-employees-to-group.usecase';
import { AssignEmployeesToGroupDto } from '../dtos/assign-employees-to-group.dto';
import { UpdateGroupDto } from '../dtos/update-group.dto';
import { UpdateGroupUseCase } from '../use-cases/update-group.usecase';
import { RemoveEmployeesFromGroupUseCase } from '../use-cases/remove-employees-from-group.usecase';

@Controller('business')
export class BusinessGroupController {
  constructor(
    private readonly createGroupUseCase: CreateGroupUseCase,
    private readonly findOneGroupUseCase: FindOneGroupUseCase,
    private readonly updateGroupUseCase: UpdateGroupUseCase,
    private readonly assignEmployeesToGroupUseCase: AssignEmployeesToGroupUseCase,
    private readonly removeEmployeesFromGroupUseCase: RemoveEmployeesFromGroupUseCase,
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
      const res = await this.findOneGroupUseCase.execute(id, groupId);

      return HTTPResponse.ok(res);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went grong');
    }
  }

  @Patch(':id/groups/:groupId')
  @Permissions('groups:read', 'groups:update')
  public async update(
    @Param('id') businessId: string,
    @Param('groupId') groupId: string,
    @Body() data: UpdateGroupDto,
  ) {
    try {
      await this.updateGroupUseCase.execute(businessId, groupId, data);

      return HTTPResponse.ok(null);
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
      await this.assignEmployeesToGroupUseCase.execute(
        businessId,
        groupId,
        data,
      );

      return HTTPResponse.ok(null);
    } catch (error) {
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
      await this.removeEmployeesFromGroupUseCase.execute(
        businessId,
        groupId,
        data,
      );

      return HTTPResponse.ok(null);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went grong');
    }
  }
}
