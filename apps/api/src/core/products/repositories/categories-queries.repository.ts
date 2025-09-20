import { and, eq, type SQL } from 'drizzle-orm';
import { DBSERVICE, type LibSQLDatabase } from '@core/db/db.module';
import { Inject, Injectable } from '@nestjs/common';
import { categories } from '@repo/db';
import { FindManyCategoriesByDto } from './dtos/find-many-categories-by.dto';
import type { CategorySummary } from '@repo/core/entities/category';

type Options = {
  ensureActive?: boolean;
};

@Injectable()
export class CategoriesQueriesRepository {
  constructor(@Inject(DBSERVICE) private readonly db: LibSQLDatabase) {}

  public async findManyBy(
    data: FindManyCategoriesByDto,
    options?: Options,
  ): Promise<CategorySummary[]> {
    const filters: SQL[] = [];
    const optionsFilters: SQL[] = [];

    if (!data.name && !data.id && !data.businessId && !data.parentId) {
      return [];
    }

    if (options?.ensureActive) {
      optionsFilters.push(eq(categories.isActive, true));
    }

    if (data.name) {
      filters.push(eq(categories.name, data.name));
    }

    if (data.id) {
      filters.push(eq(categories.id, data.id));
    }

    if (data.businessId) {
      filters.push(eq(categories.businessId, data.businessId));
    }

    if (data.parentId) {
      filters.push(eq(categories.parentId, data.parentId));
    }

    return this.db
      .select()
      .from(categories)
      .where(and(...filters, ...optionsFilters));
  }
}
