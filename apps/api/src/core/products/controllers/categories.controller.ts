import { Permissions } from '@core/auth/decorators/permissions.decorator';
import {
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Param,
  Post,
} from '@nestjs/common';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { CreateCategoryUsecase } from '../use-cases/create-category.usecase';
import { HTTPResponse } from 'src/shared/http/response';
import { FindManyCategoriesUsecase } from '../use-cases/find-many-categories.usecase';
import { FindOneCategoryUsecase } from '../use-cases/find-one-category.usecase';

@Controller('business/:id/categories')
export class CategoriesController {
  constructor(
    private readonly createCategoryUsecase: CreateCategoryUsecase,
    private readonly findManyCategoriesUsecase: FindManyCategoriesUsecase,
    private readonly findOneCategoryUsecase: FindOneCategoryUsecase,
  ) {}

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

      throw new InternalServerErrorException(
        'Algo salió mal al crear la categoría',
      );
    }
  }

  @Get()
  @Permissions('categories:read')
  public async findMany(@Param('id') businessId: string) {
    try {
      const res = await this.findManyCategoriesUsecase.execute(businessId);

      return HTTPResponse.ok(res);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Algo salió mal al buscar categorías',
      );
    }
  }

  @Get('/:categoryId')
  @Permissions('categories:read')
  public async findOne(
    @Param('id') businessId: string,
    @Param('categoryId') categoryId: string,
  ) {
    try {
      const res = await this.findOneCategoryUsecase.execute(
        businessId,
        categoryId,
      );

      return HTTPResponse.ok(res);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Algo salió mal al buscar categorías',
      );
    }
  }
}
