import { Injectable } from '@nestjs/common';
import { ProductsQueriesRepository } from '../repositories/products-queries.repository';
import { CreateProductDto } from '../dtos/create-product.dto';
import { ProductAlreadyExistsException } from '../exceptions/product-already-exists.exception';
import { ProductsCommnadsRepository } from '../repositories/products-commands.repository';
import { CategoriesQueriesRepository } from '../repositories/categories-queries.repository';
import { CategoryNotFoundException } from '../exceptions/category-not-found.exception';

@Injectable()
export class CreateProductUsecase {
  constructor(
    private readonly productsQueriesRepository: ProductsQueriesRepository,
    private readonly productsCommandsRepository: ProductsCommnadsRepository,
    private readonly categoriesQueriesRepository: CategoriesQueriesRepository,
  ) {}

  //TODO: validate if brand exists when brandId is provided
  public async execute(businessId: string, data: CreateProductDto) {
    const products = await this.productsQueriesRepository.findManyBy({
      businessId,
      barcode: data.barcode,
      name: data.name,
    });

    if (products.length > 0) {
      throw new ProductAlreadyExistsException();
    }

    if (data.categoryId) {
      const existingCategory =
        await this.categoriesQueriesRepository.findManyBy({
          businessId,
          ids: [data.categoryId],
        });

      if (existingCategory.length === 0) {
        throw new CategoryNotFoundException();
      }
    }

    await this.productsCommandsRepository.save({
      ...data,
      businessId,
    });
  }
}
