import type { ServerSyncCatalogRepository } from "@fludge/sync/repositories/catalog/server-sync-catalog.repository";
import type { CatalogLastSyncedAtQuery } from "@fludge/sync/types/catalog.types";

export class SyncServerCatalogEngine {
  constructor(
    private readonly serverSyncCatalogRepository: ServerSyncCatalogRepository,
  ) {}

  public async getLastSyncedAt(
    organizationIds: string[],
    lastSyncedAt: CatalogLastSyncedAtQuery,
  ) {
    const { products, categories, productPresentations } =
      await this.serverSyncCatalogRepository.findAllItems(
        organizationIds,
        lastSyncedAt,
      );

    return {
      products,
      categories,
      productPresentations,
    };
  }
}
