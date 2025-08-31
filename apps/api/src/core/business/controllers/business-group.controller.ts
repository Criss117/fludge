import { Permissions } from '@core/auth/decorators/permissions.decorator';
import {
  Body,
  Controller,
  HttpException,
  InternalServerErrorException,
  Param,
  Post,
} from '@nestjs/common';
import { CreateGroupDto } from '../dtos/create-group.dto';
import { CreateGroupUseCase } from '../use-cases/create-group.usecase';
import { HTTPResponse } from 'src/shared/http/response';

@Controller('business')
export class BusinessGroupController {
  constructor(private readonly createGroupUseCase: CreateGroupUseCase) {}

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
}
