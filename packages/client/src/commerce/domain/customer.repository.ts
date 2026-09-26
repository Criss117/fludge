import type { Cursor, PaginatedResponse } from "@fludge/utils/pagination";
import type { LocalCustomer } from "@fludge/db/local-schemas/shared.schema";
import type { CustomerSummary, CustomerDetail } from "./entities";

export type FindAllCustomersFilters = {
  searchQuery?: string;
};

export interface CustomerRepository {
  findAll(
    organizationId: string,
    cursor: Cursor,
    filters?: FindAllCustomersFilters,
  ): Promise<PaginatedResponse<CustomerSummary>>;

  findOneById(
    organizationId: string,
    customerId: string,
  ): Promise<CustomerDetail | null>;

  save(customer: LocalCustomer | LocalCustomer[]): Promise<void>;

  delete(organizationId: string, customerId: string | string[]): Promise<void>;
}
