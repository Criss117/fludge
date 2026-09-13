import type { CatalogLastSyncedAt } from "@fludge/sync/repositories/catalog/client-catalog.repository";
import type { ServerSyncCatalogRepository } from "@fludge/sync/repositories/catalog/server-iam.repository";

export class SyncServerCatalogEngine {
  constructor(
    private readonly serverSyncCatalogRepository: ServerSyncCatalogRepository,
  ) {}

  public async getLastSyncedAt(lastSyncedAt: CatalogLastSyncedAt) {
    const { products, categories } =
      await this.serverSyncCatalogRepository.findAllItems(lastSyncedAt);

    return {
      products,
      categories,
    };
  }
}
