import type { LocalCategory } from "@fludge/sync/entities/catalog.entities";
import type { Cursor, PaginatedResponse } from "@fludge/utils/pagination";

export type CategorySummary = LocalCategory;

export type FindAllCategoriesFilters = {
  searchQuery?: string;
};

export function normalizeFilters(filters?: FindAllCategoriesFilters) {
  return {
    searchQuery: filters?.searchQuery?.trim() || undefined,
  };
}

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

  save(category: LocalCategory | LocalCategory[]): Promise<void>;

  delete(organizationId: string, categoryId: string | string[]): Promise<void>;
}
