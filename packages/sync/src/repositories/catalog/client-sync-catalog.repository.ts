import type {
  CatalogLastSyncedAt,
  CatalogSyncResult,
} from "@fludge/sync/types/catalog.types";

export interface ClientSyncCatalogRepository {
  getLastSyncedAt: () => Promise<CatalogLastSyncedAt>;

  saveAll: (values: CatalogSyncResult) => Promise<void>;
}

export interface HttpClientSyncCatalogRepository {
  findLastSyncedAt: (
    lastSyncedAt: CatalogLastSyncedAt,
  ) => Promise<CatalogSyncResult>;
}
