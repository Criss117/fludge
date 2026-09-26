import type { LocalCategory } from "@fludge/db/local-schemas/shared.schema";
import type { Cursor, PaginatedResponse } from "@fludge/utils/pagination";
import type { CategorySummary } from "./entities";

export type FindAllCategoriesFilters = {
  searchQuery?: string;
};

export interface CategoryRepository {
  findAll(
    organizationId: string,
    cursor: Cursor,
    filters?: FindAllCategoriesFilters,
  ): Promise<PaginatedResponse<CategorySummary>>;

  findOneById(
    organizationId: string,
    categoryId: string,
  ): Promise<CategorySummary | null>;

  save(category: CategorySummary | CategorySummary[]): Promise<void>;

  delete(organizationId: string, categoryId: string | string[]): Promise<void>;
}
