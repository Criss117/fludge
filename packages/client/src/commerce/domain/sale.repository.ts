import type { LocalSale } from "@fludge/db/local-schemas/shared.schema";
import type { Cursor, PaginatedResponse } from "@fludge/utils/pagination";

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

  save(sale: LocalSale | LocalSale[]): Promise<void>;

  clearAll(): Promise<void>;
}
