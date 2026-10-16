import type { CatalogSyncCursors, CatalogSyncResult } from "@fludge/sync/types/catalog.types";

export interface ClientSyncCatalogRepository {
  getLastSyncedAt(): Promise<CatalogSyncCursors>;

  saveAll(values: CatalogSyncResult): Promise<void>;
}

export interface HttpClientSyncCatalogRepository {
  findLastSyncedAt(lastSyncedAt: CatalogSyncCursors): Promise<CatalogSyncResult>;
}
