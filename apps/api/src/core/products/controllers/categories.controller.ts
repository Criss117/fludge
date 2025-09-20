import { Permissions } from '@core/auth/decorators/permissions.decorator';
import {
  Body,
  Controller,
  HttpException,
  InternalServerErrorException,
  Param,
  Post,
} from '@nestjs/common';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { CreateCategoryUsecase } from '../use-cases/create-category.usecase';
import { HTTPResponse } from 'src/shared/http/response';

@Controller('business/:id/categories')
export class CategoriesController {
  constructor(private readonly createCategoryUsecase: CreateCategoryUsecase) {}

  @Post()
  @Permissions('categories:create')
  public async create(
    @Param('id') businessId: string,
    @Body() data: CreateCategoryDto,
  ) {
    try {
      await this.createCategoryUsecase.execute(businessId, data);

      return HTTPResponse.created(null);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
