import type {
  CatalogLastSyncedAt,
  CatalogSyncResult,
} from "@fludge/sync/types/catalog.types";

export interface ServerSyncCatalogRepository {
  findAllItems(
    organizationIds: string[],
    lastSyncedAt: CatalogLastSyncedAt,
  ): Promise<CatalogSyncResult>;
}
