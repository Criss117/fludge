import type {
  SaleLastSyncedAtLocal,
  SaleLastSyncedAtQuery,
  SaleSyncAllItems,
} from "@fludge/sync/types/sale.types";

export interface ClientSyncSaleRepository {
  getLastSyncedAt: () => Promise<SaleLastSyncedAtLocal>;

  saveAll: (values: SaleSyncAllItems) => Promise<void>;
}

export interface HttpClientSyncSaleRepository {
  findLastSyncedAt: (
    lastSyncedAt: SaleLastSyncedAtQuery,
  ) => Promise<SaleSyncAllItems>;
}
