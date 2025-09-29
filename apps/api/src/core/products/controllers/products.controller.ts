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
  Query,
} from '@nestjs/common';
import { FindManyProductsUseCase } from '../use-cases/find-many-products.usecase';
import { HTTPResponse } from 'src/shared/http/response';
import { CreateProductDto } from '../dtos/create-product.dto';
import { CreateProductUsecase } from '../use-cases/create-product.usecase';
import { PaginationParamsDto } from 'src/shared/dtos/paginations-params.dto';
import { FindOneProductUseCase } from '../use-cases/find-one-product.usecase';
import { UpdateProductUseCase } from '../use-cases/update-product.usecase';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { DeleteProductUseCase } from '../use-cases/delete-product.usecase';

@Controller('business/:id/products')
export class ProductsController {
  constructor(
    private readonly findManyProductsUseCase: FindManyProductsUseCase,
    private readonly findOneProductUseCase: FindOneProductUseCase,
    private readonly createProductUseCase: CreateProductUsecase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Get()
  @Permissions('products:read')
  public async findMany(
    @Param('id') businessId: string,
    @Query() pagination: PaginationParamsDto,
  ) {
    try {
      const res = await this.findManyProductsUseCase.execute(businessId, {
        limit: pagination.limit ?? 10,
        page: pagination.page ?? 0,
      });

      return HTTPResponse.ok(res);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Algo salió mal al buscar los productos',
      );
    }
  }

  @Post()
  @Permissions('products:create')
  public async create(
    @Param('id') businessId: string,
    @Body() data: CreateProductDto,
  ) {
    try {
      const res = await this.createProductUseCase.execute(businessId, data);

      return HTTPResponse.ok(res);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Algo salió mal al crear el producto',
      );
    }
  }

  @Get(':productId')
  @Permissions('products:read')
  public async findOne(
    @Param('id') businessId: string,
    @Param('productId') productId: string,
  ) {
    try {
      const res = await this.findOneProductUseCase.execute(
        businessId,
        productId,
      );

      return HTTPResponse.ok(res);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Algo salió mal al buscar el producto',
      );
    }
  }

  @Patch(':productId')
  @Permissions('products:update')
  public async update(
    @Param('id') businessId: string,
    @Param('productId') productId: string,
    @Body() data: UpdateProductDto,
  ) {
    try {
      const res = await this.updateProductUseCase.execute(
        businessId,
        productId,
        data,
      );

      return HTTPResponse.ok(res);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Algo salió mal al actualizar el producto',
      );
    }
  }

  @Delete(':productId')
  @Permissions('products:delete')
  public async delete(
    @Param('id') businessId: string,
    @Param('productId') productId: string,
  ) {
    try {
      await this.deleteProductUseCase.execute(businessId, productId);

      return HTTPResponse.ok(null);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Algo salió mal al eliminar el producto',
      );
    }
  }
}
