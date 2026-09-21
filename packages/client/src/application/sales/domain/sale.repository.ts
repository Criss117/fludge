import type {
  LocalSaleItemSelect,
  LocalSaleSelect,
} from "@fludge/db/local-schemas/shared.schema";
import type { Cursor, PaginatedResponse } from "@fludge/utils/pagination";

export type SaleDetail = LocalSaleSelect & {
  items: LocalSaleItemSelect[];
};

export type FindAllSalesFilters = {
  customerId?: string;
};

export interface SaleRepository {
  findAll(
    organizationId: string,
    cursor: Cursor,
    filters?: FindAllSalesFilters,
  ): Promise<PaginatedResponse<SaleDetail>>;

  save(sale: SaleDetail | SaleDetail[]): Promise<void>;
}
