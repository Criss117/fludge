import type { Cursor, PaginatedResponse } from "@fludge/utils/pagination";
import type { SaleDetail } from "./entities";

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
