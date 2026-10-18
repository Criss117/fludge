import type { LocalSale } from "@fludge/db/local-schemas/shared.schema";
import type { RepositoryError } from "@fludge/utils/errors/repository.error";
import type { Cursor, PaginatedResponse } from "@fludge/utils/pagination";
import type { Result } from "@fludge/utils/trycatch";

import type { SaleSummary } from "./entities";

export type FindAllSalesFilters = {
  customerId?: string;
};

export interface SaleRepository {
  findAll(
    organizationId: string,
    cursor: Cursor,
    filters?: FindAllSalesFilters,
  ): Promise<Result<PaginatedResponse<SaleSummary>, RepositoryError>>;

  save(sale: LocalSale | LocalSale[]): Promise<Result<void, RepositoryError>>;

  clearAll(): Promise<Result<void, RepositoryError>>;
}
