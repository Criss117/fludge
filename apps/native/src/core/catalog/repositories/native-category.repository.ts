import { DatabaseService } from "@/integrations/db";
import type {
  CategoryRepository,
  CategorySummary,
  FindAllCategoriesFilters,
} from "@fludge/client/catalog/domain/category.repository";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import { and, desc, eq, inArray, like } from "drizzle-orm";
import {
  type Cursor,
  type PaginatedResponse,
  paginate,
} from "@fludge/utils/pagination";
import {
  localCategory,
  LocalCategory,
} from "@fludge/db/local-schemas/shared.schema";

export class NativeCategoryRepository implements CategoryRepository {
  constructor(private readonly db: DatabaseService) {}

  public async clearAll(): Promise<void> {
    this.db.transaction((tx) => {
      tx.delete(localCategory).run();
    });
  }

  public async findAll(
    organizationId: string,
    cursor: Cursor,
    filters?: FindAllCategoriesFilters
  ): Promise<PaginatedResponse<CategorySummary>> {
    const rows = this.db
      .select()
      .from(localCategory)
      .where(
        and(
          eq(localCategory.organizationId, organizationId),
          filters?.searchQuery
            ? like(localCategory.name, `%${filters.searchQuery}%`)
            : undefined
        )
      )
      .limit(cursor.limit + 1)
      .offset(cursor.limit * cursor.page)
      .orderBy(desc(localCategory.createdAt))
      .all();

    return paginate(rows, cursor);
  }

  public async findOneById(
    organizationId: string,
    categoryId: string
  ): Promise<CategorySummary | null> {
    const row = this.db
      .select()
      .from(localCategory)
      .where(
        and(
          eq(localCategory.organizationId, organizationId),
          eq(localCategory.id, categoryId)
        )
      )
      .limit(0)
      .get();

    return row || null;
  }

  public async save(
    categoryValues: LocalCategory | LocalCategory[]
  ): Promise<void> {
    const categoriesArray = Array.isArray(categoryValues)
      ? categoryValues
      : [categoryValues];

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
  }

  public async delete(
    organizationId: string,
    categoryId: string | string[]
  ): Promise<void> {
    const categoryIds = Array.isArray(categoryId) ? categoryId : [categoryId];

    this.db
      .delete(localCategory)
      .where(
        and(
          eq(localCategory.organizationId, organizationId),
          inArray(localCategory.id, categoryIds)
        )
      )
      .run();
  }
}
