import type {
  CustomerLastSyncedAtQuery,
  CustomerSyncAllItems,
} from "@fludge/sync/types/customer.types";

export interface ServerSyncCustomerRepository {
  findAllItems: (
    organizationIds: string[],
    lastSyncedAt: CustomerLastSyncedAtQuery,
  ) => Promise<CustomerSyncAllItems>;
}