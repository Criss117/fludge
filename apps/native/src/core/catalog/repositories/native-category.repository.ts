import type {
  CategoryRepository,
  CategorySummary,
  FindAllCategoriesFilters,
} from "@fludge/client/catalog/domain/category.repository";
import type { LocalCategory } from "@fludge/db/local-schemas/shared.schema";
import { localCategory } from "@fludge/db/local-schemas/shared.schema";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import { type RepositoryError, toRepositoryError } from "@fludge/utils/errors/repository.error";
import { type Cursor, paginate, type PaginatedResponse } from "@fludge/utils/pagination";
import { type Result, tryCatch } from "@fludge/utils/trycatch";
import { and, desc, eq, inArray, like } from "drizzle-orm";

import type { DatabaseService } from "@/integrations/db";

export class NativeCategoryRepository implements CategoryRepository {
  constructor(private readonly db: DatabaseService) {}

  public async clearAll(): Promise<Result<void, RepositoryError>> {
    return tryCatch(
      () => {
        this.db.transaction((tx) => {
          tx.delete(localCategory).run();
        });
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.catalog.categories.isr_on_delete", raw),
      },
    );
  }

  public async findAll(
    organizationId: string,
    cursor: Cursor,
    filters?: FindAllCategoriesFilters,
  ): Promise<Result<PaginatedResponse<CategorySummary>, RepositoryError>> {
    return tryCatch(
      () => {
        const rows = this.db
          .select()
          .from(localCategory)
          .where(
            and(
              eq(localCategory.organizationId, organizationId),
              filters?.searchQuery
                ? like(localCategory.name, `%${filters.searchQuery}%`)
                : undefined,
            ),
          )
          .limit(cursor.limit + 1)
          .offset(cursor.limit * cursor.page)
          .orderBy(desc(localCategory.createdAt))
          .all();

        return paginate(rows, cursor);
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.catalog.categories.isr_on_find", raw),
      },
    );
  }

  public async findOneById(
    organizationId: string,
    categoryId: string,
  ): Promise<Result<CategorySummary | null, RepositoryError>> {
    return tryCatch(
      () => {
        const row = this.db
          .select()
          .from(localCategory)
          .where(
            and(eq(localCategory.organizationId, organizationId), eq(localCategory.id, categoryId)),
          )
          .limit(0)
          .get();

        return row || null;
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.catalog.categories.isr_on_find", raw),
      },
    );
  }

  public async save(
    categoryValues: LocalCategory | LocalCategory[],
  ): Promise<Result<void, RepositoryError>> {
    return tryCatch(
      () => {
        const categoriesArray = Array.isArray(categoryValues) ? categoryValues : [categoryValues];

        if (categoriesArray.length === 0) return;

        this.db
          .insert(localCategory)
          .values(categoriesArray)
          .onConflictDoUpdate({
            target: localCategory.id,
            set: buildConflictUpdateColumn(localCategory, [
              "name",
              "slug",
              "status",
              "description",
            ]),
          })
          .run();
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.catalog.categories.isr_on_save", raw),
      },
    );
  }

  public async delete(
    organizationId: string,
    categoryId: string | string[],
  ): Promise<Result<void, RepositoryError>> {
    return tryCatch(
      () => {
        const categoryIds = Array.isArray(categoryId) ? categoryId : [categoryId];

        this.db
          .delete(localCategory)
          .where(
            and(
              eq(localCategory.organizationId, organizationId),
              inArray(localCategory.id, categoryIds),
            ),
          )
          .run();
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.catalog.categories.isr_on_delete", raw),
      },
    );
  }
}
