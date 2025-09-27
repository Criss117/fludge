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
import { FindManyProductsUseCase } from '../use-cases/find-many-products.usecase';
import { HTTPResponse } from 'src/shared/http/response';
import { CreateProductDto } from '../dtos/create-product.dto';
import { CreateProductUsecase } from '../use-cases/create-product.usecase';

@Controller('business/:id/products')
export class ProductsController {
  constructor(
    private readonly findManyProductsUseCase: FindManyProductsUseCase,
    private readonly createProductUseCase: CreateProductUsecase,
  ) {}

  @Get()
  @Permissions('products:read')
  public async findMany(@Param('id') businessId: string) {
    try {
      const res = await this.findManyProductsUseCase.execute(businessId);

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
}
