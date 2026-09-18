import type {
  CatalogLastSyncedAtQuery,
  SyncCatalogAllItems,
} from "@fludge/sync/types/catalog.types";

export interface ServerSyncCatalogRepository {
  findAllItems: (
    organizationIds: string[],
    lastSyncedAt: CatalogLastSyncedAtQuery,
  ) => Promise<SyncCatalogAllItems>;
}
