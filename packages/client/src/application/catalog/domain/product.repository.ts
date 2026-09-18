import type {
  LocalProductPresentationSelect,
  LocalProductSelect,
} from "@fludge/db/local-schemas/shared.schema";
import type { Cursor, PaginatedResponse } from "@fludge/utils/pagination";

export type ProductDetail = LocalProductSelect & {
  presentations: LocalProductPresentationSelect[];
};

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
  ): Promise<PaginatedResponse<ProductDetail>>;

  findOneById(
    organizationId: string,
    productId: string,
  ): Promise<ProductDetail | null>;

  save(product: ProductDetail | ProductDetail[]): Promise<void>;

  delete(organizationId: string, productId: string | string[]): Promise<void>;
}
