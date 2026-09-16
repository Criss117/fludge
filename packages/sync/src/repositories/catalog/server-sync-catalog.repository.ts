import type {
  LocalCategory,
  LocalProduct,
} from "@fludge/sync/entities/catalog.entities";

export type CatalogLastSyncedAt = {
  product: Date | null;
  category: Date | null;
};

export type SyncCatalogAllItems = {
  products: LocalProduct[];
  categories: LocalCategory[];
};

export interface ServerSyncCatalogRepository {
  findAllItems: (
    organizationIds: string[],
    lastSyncedAt: CatalogLastSyncedAt,
  ) => Promise<SyncCatalogAllItems>;
}
