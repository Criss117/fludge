import { Permissions } from '@core/auth/decorators/permissions.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { CreateCategoryUsecase } from '../use-cases/create-category.usecase';
import { HTTPResponse } from 'src/shared/http/response';
import { FindManyCategoriesUsecase } from '../use-cases/find-many-categories.usecase';
import { FindOneCategoryUsecase } from '../use-cases/find-one-category.usecase';
import { DeleteManyCategoriesDto } from '../dtos/delete-many-categories';
import { DeleteManyCategoriesUsecase } from '../use-cases/delete-many-categories.usecase';
import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { UpdateCategoryUseCase } from '../use-cases/update-category.usecase';

@Controller('business/:id/categories')
export class CategoriesController {
  constructor(
    private readonly createCategoryUsecase: CreateCategoryUsecase,
    private readonly findManyCategoriesUsecase: FindManyCategoriesUsecase,
    private readonly findOneCategoryUsecase: FindOneCategoryUsecase,
    private readonly deleteManyCategoriesUsecase: DeleteManyCategoriesUsecase,
    private readonly updateCategoryUsecase: UpdateCategoryUseCase,
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

  @Delete('/delete-many')
  @Permissions('categories:delete')
  public async deleteMany(
    @Param('id') businessId: string,
    @Body() data: DeleteManyCategoriesDto,
  ) {
    try {
      await this.deleteManyCategoriesUsecase.execute(businessId, data);

      return HTTPResponse.ok(null);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Algo salió mal al eliminar categorías',
      );
    }
  }

  @Patch('/:categoryId')
  @Permissions('categories:update')
  public async update(
    @Param('id') businessId: string,
    @Param('categoryId') categoryId: string,
    @Body() data: UpdateCategoryDto,
  ) {
    try {
      await this.updateCategoryUsecase.execute(businessId, categoryId, data);

      return HTTPResponse.ok(null);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Algo salió mal al eliminar categorías',
      );
    }
  }
}
