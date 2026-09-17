import type { LocalProduct } from "@fludge/sync/entities/catalog.entities";
import type { Cursor, PaginatedResponse } from "@fludge/utils/pagination";

export type ProductSummary = LocalProduct;

export type ProductDetail = LocalProduct;

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
  ): Promise<ProductDetail | null>;

  save(product: LocalProduct | LocalProduct[]): Promise<LocalProduct[]>;

  delete(organizationId: string, productId: string | string[]): Promise<void>;
}
