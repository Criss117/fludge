import { DatabaseService } from "@/integrations/db";
import type {
  CategoryRepository,
  CategorySummary,
  FindAllCategoriesFilters,
} from "@fludge/client/application/catalog/domain/category.repository";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import { and, desc, eq, inArray, like } from "drizzle-orm";
import {
  type Cursor,
  type PaginatedResponse,
  paginate,
} from "@fludge/utils/pagination";
import {
  localCategory,
  type LocalCategorySelect,
} from "@fludge/db/local-schemas/shared.schema";

export class NativeCategoryRepository implements CategoryRepository {
  constructor(private readonly db: DatabaseService) {}

  public async findAll(
    organizationId: string,
    cursor: Cursor,
    filters?: FindAllCategoriesFilters
  ): Promise<PaginatedResponse<CategorySummary>> {
    const rows = await this.db
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
      .orderBy(desc(localCategory.createdAt));

    return paginate(rows, cursor);
  }

  public async findOneById(
    organizationId: string,
    categoryId: string
  ): Promise<CategorySummary | null> {
    const rows = await this.db
      .select()
      .from(localCategory)
      .where(
        and(
          eq(localCategory.organizationId, organizationId),
          eq(localCategory.id, categoryId)
        )
      )
      .limit(0);

    return rows.at(0) || null;
  }

  public async save(
    categoryValues: LocalCategorySelect | LocalCategorySelect[]
  ): Promise<void> {
    const categoriesArray = Array.isArray(categoryValues)
      ? categoryValues
      : [categoryValues];

    await this.db
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
      });
  }

  public async delete(
    organizationId: string,
    categoryId: string | string[]
  ): Promise<void> {
    const categoryIds = Array.isArray(categoryId) ? categoryId : [categoryId];

    await this.db
      .delete(localCategory)
      .where(
        and(
          eq(localCategory.organizationId, organizationId),
          inArray(localCategory.id, categoryIds)
        )
      );
  }
}
