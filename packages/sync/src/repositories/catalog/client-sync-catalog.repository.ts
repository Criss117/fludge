import type {
  LocalCategory,
  LocalProduct,
} from "@fludge/sync/entities/catalog.entities";
import type {
  CatalogLastSyncedAt,
  SyncCatalogAllItems,
} from "./server-sync-catalog.repository";

export type GetCatalogLastSyncedAt = {
  product: LocalProduct | null;
  category: LocalCategory | null;
};

export interface ClientSyncCatalogRepository {
  getLastSyncedAt: () => Promise<GetCatalogLastSyncedAt>;

  saveAll: (values: SyncCatalogAllItems) => Promise<void>;
}

export interface HttpClientSyncCatalogRepository {
  findLastSyncedAt: (
    lastSyncedAt: CatalogLastSyncedAt,
  ) => Promise<SyncCatalogAllItems>;
}
