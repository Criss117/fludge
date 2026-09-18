import type {
  CatalogLastSyncedAtLocal,
  CatalogLastSyncedAtQuery,
  SyncCatalogAllItems,
} from "@fludge/sync/types/catalog.types";

export interface ClientSyncCatalogRepository {
  getLastSyncedAt: () => Promise<CatalogLastSyncedAtLocal>;

  saveAll: (values: SyncCatalogAllItems) => Promise<void>;
}

export interface HttpClientSyncCatalogRepository {
  findLastSyncedAt: (
    lastSyncedAt: CatalogLastSyncedAtQuery,
  ) => Promise<SyncCatalogAllItems>;
}
