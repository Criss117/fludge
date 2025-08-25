import {
  Body,
  Controller,
  HttpException,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { CreateBusinessUseCase } from '../use-cases/create-business.usecase';
import { CreateBusinessDto } from '../dtos/create-business.dto';
import { GetUser } from '@core/auth/decorators/get-user.decorator';
import type { SelectUser } from '@repo/db';
import { UserNoRootException } from '@core/users/exeptions/user-no-root.exeption';
import { HTTPResponse } from 'src/shared/http/response';

@Controller('business')
export class BusinessController {
  constructor(private readonly createBusinessUseCase: CreateBusinessUseCase) {}

  @Post()
  public async create(
    @Body() data: CreateBusinessDto,
    @GetUser() user: SelectUser,
  ) {
    if (!user.isRoot) {
      throw new UserNoRootException();
    }

    try {
      await this.createBusinessUseCase.execute(data, user.id);

      return HTTPResponse.created(null);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
