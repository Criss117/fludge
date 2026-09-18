import type {
  CatalogLastSyncedAtQuery,
  CatalogSyncAllItems,
} from "@fludge/sync/types/catalog.types";

export interface ServerSyncCatalogRepository {
  findAllItems: (
    organizationIds: string[],
    lastSyncedAt: CatalogLastSyncedAtQuery,
  ) => Promise<CatalogSyncAllItems>;
}
