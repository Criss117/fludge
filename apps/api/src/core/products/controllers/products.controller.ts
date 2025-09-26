import { Permissions } from '@core/auth/decorators/permissions.decorator';
import {
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { FindManyProductsUseCase } from '../use-cases/find-many-products.usecase';
import { HTTPResponse } from 'src/shared/http/response';

@Controller('business/:id/products')
export class ProductsController {
  constructor(
    private readonly findManyProductsUseCase: FindManyProductsUseCase,
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
}
