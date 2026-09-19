import type {
  CustomerLastSyncedAtLocal,
  CustomerLastSyncedAtQuery,
  CustomerSyncAllItems,
} from "@fludge/sync/types/customer.types";

export interface ClientSyncCustomerRepository {
  getLastSyncedAt: () => Promise<CustomerLastSyncedAtLocal>;

  saveAll: (values: CustomerSyncAllItems) => Promise<void>;
}

export interface HttpClientSyncCustomerRepository {
  findLastSyncedAt: (
    lastSyncedAt: CustomerLastSyncedAtQuery,
  ) => Promise<CustomerSyncAllItems>;
}