import type {
  SaleLastSyncedAtQuery,
  SaleSyncAllItems,
} from "@fludge/sync/types/sale.types";

export interface ServerSyncSaleRepository {
  findAllItems: (
    organizationIds: string[],
    lastSyncedAt: SaleLastSyncedAtQuery,
  ) => Promise<SaleSyncAllItems>;
}
