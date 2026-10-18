import type { LocalCustomer } from "@fludge/db/local-schemas/shared.schema";
import type { RepositoryError } from "@fludge/utils/errors/repository.error";
import type { Cursor, PaginatedResponse } from "@fludge/utils/pagination";
import type { Result } from "@fludge/utils/trycatch";

import type { CustomerDetail, CustomerSummary } from "./entities";

export type FindAllCustomersFilters = {
  searchQuery?: string;
};

export interface CustomerRepository {
  findAll(
    organizationId: string,
    cursor: Cursor,
    filters?: FindAllCustomersFilters,
  ): Promise<Result<PaginatedResponse<CustomerSummary>, RepositoryError>>;

  findOneById(
    organizationId: string,
    customerId: string,
  ): Promise<Result<CustomerDetail | null, RepositoryError>>;

  save(customer: LocalCustomer | LocalCustomer[]): Promise<Result<void, RepositoryError>>;

  delete(
    organizationId: string,
    customerId: string | string[],
  ): Promise<Result<void, RepositoryError>>;

  clearAll(): Promise<Result<void, RepositoryError>>;
}
