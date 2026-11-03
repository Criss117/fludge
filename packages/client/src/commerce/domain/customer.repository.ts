import type { Filters } from "@fludge/client/shared/use-filters";
import type { LocalCustomer } from "@fludge/db/local-schemas/shared.schema";
import type { RepositoryError } from "@fludge/utils/errors/repository.error";
import type { Cursor, PaginatedResponse } from "@fludge/utils/pagination";
import type { Result } from "@fludge/utils/trycatch";

import type { CustomerPaymentSummary, CustomerSummary } from "./entities";

export interface FindCustomerPaymentsFilters {
  customerId: string;
}

export interface CustomerRepository {
  findAll(
    organizationId: string,
    cursor: Cursor,
    filters?: Filters,
  ): Promise<Result<PaginatedResponse<CustomerSummary>, RepositoryError>>;

  findOneById(
    organizationId: string,
    customerId: string,
  ): Promise<Result<CustomerSummary | null, RepositoryError>>;

  findCustomerPayments(
    organizationId: string,
    cursor: Cursor,
    filters: FindCustomerPaymentsFilters,
  ): Promise<Result<PaginatedResponse<CustomerPaymentSummary>, RepositoryError>>;

  save(customer: LocalCustomer | LocalCustomer[]): Promise<Result<void, RepositoryError>>;

  delete(
    organizationId: string,
    customerId: string | string[],
  ): Promise<Result<void, RepositoryError>>;

  clearAll(): Promise<Result<void, RepositoryError>>;
}
