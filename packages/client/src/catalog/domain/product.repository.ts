import type { LocalProduct } from "@fludge/db/local-schemas/shared.schema";
import type { RepositoryError } from "@fludge/utils/errors/repository.error";
import type { Cursor, PaginatedResponse } from "@fludge/utils/pagination";
import type { Result } from "@fludge/utils/trycatch";

import type { ProductSummary } from "./entities";

export type { ProductDetail } from "./entities";

export type FindAllProductsFilters = {
  searchQuery: string;
  status: "active" | "inactive" | "discontinued" | "all";
  orderBy: {
    createdAt: "asc" | "desc";
    stock: "asc" | "desc" | "none";
  };
};

export interface ProductRepository {
  findAll(
    organizationId: string,
    cursor: Cursor,
    filters?: FindAllProductsFilters,
  ): Promise<Result<PaginatedResponse<ProductSummary>, RepositoryError>>;

  findOneById(
    organizationId: string,
    productId: string,
  ): Promise<Result<ProductSummary | null, RepositoryError>>;

  save(product: LocalProduct | LocalProduct[]): Promise<Result<void, RepositoryError>>;

  delete(
    organizationId: string,
    productId: string | string[],
  ): Promise<Result<void, RepositoryError>>;

  clearAll(): Promise<Result<void, RepositoryError>>;
}
