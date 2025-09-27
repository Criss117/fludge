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
    const orFilters: SQL[] = [];
    const andFilters: SQL[] = [];
    const optionsFilters: SQL[] = [];

    if (options?.ensureActive) {
      optionsFilters.push(eq(products.isActive, true));
    }

    if (meta.name) {
      orFilters.push(eq(products.name, meta.name));
    }

    if (meta.categoryId) {
      orFilters.push(eq(products.categoryId, meta.categoryId));
    }

    if (meta.brandId) {
      orFilters.push(eq(products.brandId, meta.brandId));
    }

    if (meta.barcode) {
      orFilters.push(eq(products.barcode, meta.barcode));
    }

    if (meta.id) {
      orFilters.push(eq(products.id, meta.id));
    }

    if (meta.businessId) {
      andFilters.push(eq(products.businessId, meta.businessId));
    }

    return this.db
      .select()
      .from(products)
      .where(and(or(...orFilters), ...andFilters, ...optionsFilters));
  }
}
