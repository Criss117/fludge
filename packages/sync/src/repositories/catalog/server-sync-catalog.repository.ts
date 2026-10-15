import type {
  CatalogSyncCursors,
  CatalogSyncResult,
} from "@fludge/sync/types/catalog.types";

export interface ServerSyncCatalogRepository {
  findAllItems(
    organizationIds: string[],
    cursors: CatalogSyncCursors,
    limit?: number,
  ): Promise<CatalogSyncResult>;
}
