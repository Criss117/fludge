import type {
  CatalogLastSyncedAtLocal,
  CatalogLastSyncedAtQuery,
  CatalogSyncAllItems,
} from "@fludge/sync/types/catalog.types";

export interface ClientSyncCatalogRepository {
  getLastSyncedAt: () => Promise<CatalogLastSyncedAtLocal>;

  saveAll: (values: CatalogSyncAllItems) => Promise<void>;
}

export interface HttpClientSyncCatalogRepository {
  findLastSyncedAt: (
    lastSyncedAt: CatalogLastSyncedAtQuery,
  ) => Promise<CatalogSyncAllItems>;
}
