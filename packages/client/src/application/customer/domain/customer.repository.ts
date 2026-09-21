import type { LocalCustomerSelect } from "@fludge/db/local-schemas/shared.schema";
import type { Cursor, PaginatedResponse } from "@fludge/utils/pagination";
import type { SaleDetail } from "@fludge/client/application/sales/domain/sale.repository";

export type CustomerSummary = LocalCustomerSelect;

export type CustomerDetail = CustomerSummary & {
  sales: SaleDetail[];
};

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

  save(customer: LocalCustomerSelect | LocalCustomerSelect[]): Promise<void>;

  delete(organizationId: string, customerId: string | string[]): Promise<void>;
}
