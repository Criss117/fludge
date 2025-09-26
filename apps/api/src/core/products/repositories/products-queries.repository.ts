import { and, eq, type SQL } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { DBSERVICE, type LibSQLDatabase } from '@core/db/db.module';
import { ProductSummary } from '@repo/core/entities/product';
import { products } from '@repo/db';

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
}
