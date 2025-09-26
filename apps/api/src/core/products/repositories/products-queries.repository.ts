import { and, eq, type SQL, or } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { DBSERVICE, type LibSQLDatabase } from '@core/db/db.module';
import { ProductSummary } from '@repo/core/entities/product';
import { products } from '@repo/db';
import { FindManyProductsByDto } from './dtos/find-many-products-by.dto';

type Options = {
  ensureActive?: boolean;
};

@Injectable()
export class ProductsQueriesRepository {
  constructor(@Inject(DBSERVICE) private readonly db: LibSQLDatabase) {}

  public async findMany(
    businessId: string,
    options?: Options,
  ): Promise<ProductSummary[]> {
    const optionsFilters: SQL[] = [];

    if (options?.ensureActive) {
      optionsFilters.push(eq(products.isActive, true));
    }

    return this.db
      .select()
      .from(products)
      .where(and(eq(products.businessId, businessId), ...optionsFilters));
  }

  public async findManyBy(
    meta: FindManyProductsByDto,
    options?: Options,
  ): Promise<ProductSummary[]> {
    const filters: SQL[] = [];
    const optionsFilters: SQL[] = [];

    if (options?.ensureActive) {
      optionsFilters.push(eq(products.isActive, true));
    }

    if (meta.name) {
      filters.push(eq(products.name, meta.name));
    }

    if (meta.categoryId) {
      filters.push(eq(products.categoryId, meta.categoryId));
    }

    if (meta.brandId) {
      filters.push(eq(products.brandId, meta.brandId));
    }

    if (meta.barcode) {
      filters.push(eq(products.barcode, meta.barcode));
    }

    if (meta.id) {
      filters.push(eq(products.id, meta.id));
    }

    if (meta.businessId) {
      filters.push(eq(products.businessId, meta.businessId));
    }

    return this.db
      .select()
      .from(products)
      .where(and(or(...filters), ...optionsFilters));
  }
}
