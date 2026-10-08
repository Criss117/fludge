import type { Cursor, PaginatedResponse } from "@fludge/utils/pagination";
import type { ProductSummary } from "./entities";
import type { LocalProduct } from "@fludge/db/local-schemas/shared.schema";

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
  ): Promise<PaginatedResponse<ProductSummary>>;

  findOneById(
    organizationId: string,
    productId: string,
  ): Promise<ProductSummary | null>;

  save(product: LocalProduct | LocalProduct[]): Promise<void>;

  delete(organizationId: string, productId: string | string[]): Promise<void>;

  clearAll(): Promise<void>;
}
