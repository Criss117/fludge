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
    meta: FindManyCategoriesByDto,
    options?: Options,
  ): Promise<CategorySummary[]> {
    const filters: SQL[] = [];
    const optionsFilters: SQL[] = [];

    if (!meta.name && !meta.id && !meta.businessId && !meta.parentId) {
      return [];
    }

    if (options?.ensureActive) {
      optionsFilters.push(eq(categories.isActive, true));
    }

    if (meta.name) {
      filters.push(eq(categories.name, meta.name));
    }

    if (meta.id) {
      filters.push(eq(categories.id, meta.id));
    }

    if (meta.businessId) {
      filters.push(eq(categories.businessId, meta.businessId));
    }

    if (meta.parentId) {
      filters.push(eq(categories.parentId, meta.parentId));
    }

    console.log({ meta });

    return this.db
      .select()
      .from(categories)
      .where(and(...filters, ...optionsFilters));
  }
}
