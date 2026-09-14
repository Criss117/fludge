import type { LocalProduct } from "@fludge/sync/entities/catalog.entities";

export type ProductSummary = LocalProduct;

export type FindAllProductsFilters = {
  searchQuery?: string;
};

export function normalizeFilters(filters?: FindAllProductsFilters) {
  return {
    searchQuery: filters?.searchQuery?.trim() || undefined,
  };
}

export interface ProductRepository {
  findAll(
    organizationId: string,
    filters?: FindAllProductsFilters,
  ): Promise<ProductSummary[]>;

  findOneById(
    organizationId: string,
    productId: string,
  ): Promise<ProductSummary | null>;

  save(product: LocalProduct | LocalProduct[]): Promise<void>;

  delete(organizationId: string, productId: string | string[]): Promise<void>;
}
