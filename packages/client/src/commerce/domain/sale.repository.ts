import type { PaginatedResponse, Cursor } from "@fludge/utils/pagination";
import type { SaleSummary } from "./entities";

export type FindAllSalesFilters = {
  customerId?: string;
};

export interface SaleRepository {
  findAll(
    organizationId: string,
    cursor: Cursor,
    filters?: FindAllSalesFilters,
  ): Promise<PaginatedResponse<SaleSummary>>;

  save(sale: SaleSummary | SaleSummary[]): Promise<void>;

  clearAll(): Promise<void>;
}
