import { Injectable } from '@nestjs/common';
import { ProductsQueriesRepository } from '../repositories/products-queries.repository';
import { PaginationResponse } from 'src/shared/http/pagination-response';
import { ProductSummary } from '@repo/core/entities/product';
import { DEFAULT_LIMIT } from 'src/shared/utils/constants';

@Injectable()
export class FindManyProductsUseCase {
  constructor(
    private readonly productsQueriesRepository: ProductsQueriesRepository,
  ) {}

  public async execute(
    bussinessId: string,
    options?: { limit?: number; page?: number },
  ): Promise<PaginationResponse<ProductSummary>> {
    const limit = options?.limit ?? DEFAULT_LIMIT;
    const page = options?.page ?? 0;

    const productsPromise = this.productsQueriesRepository.findMany(
      bussinessId,
      {
        limit: limit + 1,
        offset: page * limit,
      },
    );

    const totalProductsPromise = this.productsQueriesRepository.countProducts(
      bussinessId,
      {
        ensureActive: true,
      },
    );

    const [products, totalProducts] = await Promise.all([
      productsPromise,
      totalProductsPromise,
    ]);

    const hasMore = products.length > limit;

    return {
      items: products.slice(0, limit),
      totalItems: totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      page: page,
      limit: limit,
      hasMore: hasMore,
    };
  }
}
