import type { RepositoryError } from "@fludge/utils/errors/repository.error";
import type { Cursor, PaginatedResponse } from "@fludge/utils/pagination";
import type { Result } from "@fludge/utils/trycatch";

import type { CategorySummary } from "./entities";

export type { CategorySummary } from "./entities";

export type FindAllCategoriesFilters = {
  searchQuery?: string;
};

export interface CategoryRepository {
  findAll(
    organizationId: string,
    cursor: Cursor,
    filters?: FindAllCategoriesFilters,
  ): Promise<Result<PaginatedResponse<CategorySummary>, RepositoryError>>;

  findOneById(
    organizationId: string,
    categoryId: string,
  ): Promise<Result<CategorySummary | null, RepositoryError>>;

  save(category: CategorySummary | CategorySummary[]): Promise<Result<void, RepositoryError>>;

  delete(
    organizationId: string,
    categoryId: string | string[],
  ): Promise<Result<void, RepositoryError>>;

  clearAll(): Promise<Result<void, RepositoryError>>;
}
