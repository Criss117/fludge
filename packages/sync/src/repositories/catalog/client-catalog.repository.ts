import type {
  LocalCategory,
  LocalProduct,
} from "@fludge/sync/entities/catalog.entities";

export type CatalogLastSyncedAt = {
  product: Date | null;
  category: Date | null;
};

type AllItems = {
  products: LocalProduct[];
  categories: LocalCategory[];
};

export interface LocalClientCatalogRepository {
  getLastSyncedAt: () => Promise<{
    product: LocalProduct | null;
    category: LocalCategory | null;
  }>;

  saveAll: (values: AllItems) => Promise<void>;
}

export interface HttpClientCatalogRepository {
  findLastSyncedAt: (lastSyncedAt: CatalogLastSyncedAt) => Promise<AllItems>;
}
