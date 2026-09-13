import type {
  LocalCategory,
  LocalProduct,
} from "@fludge/sync/entities/catalog.entities";
import type { CatalogLastSyncedAt } from "./client-catalog.repository";

type AllItems = {
  products: LocalProduct[];
  categories: LocalCategory[];
};

export interface ServerSyncCatalogRepository {
  findAllItems: (
    organizationIds: string[],
    lastSyncedAt: CatalogLastSyncedAt,
  ) => Promise<AllItems>;
}
