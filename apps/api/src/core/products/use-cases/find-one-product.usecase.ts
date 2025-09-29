import { Injectable } from '@nestjs/common';
import { ProductsQueriesRepository } from '../repositories/products-queries.repository';
import { ProductNotFoundException } from '../exceptions/product-not-found.exception';

@Injectable()
export class FindOneProductUseCase {
  constructor(
    private readonly productsQueriesRepository: ProductsQueriesRepository,
  ) {}

  public async execute(businessId: string, productId: string) {
    const res = await this.productsQueriesRepository.findOneBy({
      productId,
      businessId,
    });

    if (!res) {
      throw new ProductNotFoundException();
    }

    return res;
  }
}
