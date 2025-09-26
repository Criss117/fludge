import { Injectable } from '@nestjs/common';
import { ProductsQueriesRepository } from '../repositories/products-queries.repository';

@Injectable()
export class FindManyProductsUseCase {
  constructor(
    private readonly productsQueriesRepository: ProductsQueriesRepository,
  ) {}

  public async execute(bussinessId: string) {
    return this.productsQueriesRepository.findMany(bussinessId);
  }
}
