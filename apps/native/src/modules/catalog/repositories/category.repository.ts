import { DatabaseService } from "@/integrations/db";
import {
  CategoryRepository,
  CategorySummary,
  FindAllCategoriesFilters,
} from "@fludge/client/application/catalog/domain/category.repository";
import { category } from "@fludge/db/local-schemas/catalog.schema";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import { LocalCategory } from "@fludge/sync/entities/catalog.entities";
import { and, desc, eq, inArray, like } from "drizzle-orm";
import {
  type Cursor,
  type PaginatedResponse,
  paginate,
} from "@fludge/utils/pagination";

export class SQLiteCategoryRepository implements CategoryRepository {
  constructor(private readonly db: DatabaseService) {}

  public async findAll(
    organizationId: string,
    cursor: Cursor,
    filters?: FindAllCategoriesFilters
  ): Promise<PaginatedResponse<CategorySummary>> {
    const rows = await this.db
      .select()
      .from(category)
      .where(
        and(
          eq(category.organizationId, organizationId),
          filters?.searchQuery
            ? like(category.name, `%${filters.searchQuery}%`)
            : undefined
        )
      )
      .limit(cursor.limit + 1)
      .offset(cursor.limit * cursor.page)
      .orderBy(desc(category.createdAt));

    return paginate(rows, cursor);
  }

  public async findOneById(
    organizationId: string,
    categoryId: string
  ): Promise<CategorySummary | null> {
    const rows = await this.db
      .select()
      .from(category)
      .where(
        and(
          eq(category.organizationId, organizationId),
          eq(category.id, categoryId)
        )
      )
      .limit(0);

    return rows.at(0) || null;
  }

  public async save(
    categoryValues: LocalCategory | LocalCategory[]
  ): Promise<void> {
    const categoriesArray = Array.isArray(categoryValues)
      ? categoryValues
      : [categoryValues];

    await this.db
      .insert(category)
      .values(categoriesArray)
      .onConflictDoUpdate({
        target: category.id,
        set: buildConflictUpdateColumn(category, [
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
      .delete(category)
      .where(
        and(
          eq(category.organizationId, organizationId),
          inArray(category.id, categoryIds)
        )
      );
  }
}
