import type {
  CatalogLastSyncedAt,
  ServerSyncCatalogRepository,
} from "@fludge/sync/repositories/catalog/server-sync-catalog.repository";

export class SyncServerCatalogEngine {
  constructor(
    private readonly serverSyncCatalogRepository: ServerSyncCatalogRepository,
  ) {}

  public async getLastSyncedAt(
    organizationIds: string[],
    lastSyncedAt: CatalogLastSyncedAt,
  ) {
    const { products, categories } =
      await this.serverSyncCatalogRepository.findAllItems(
        organizationIds,
        lastSyncedAt,
      );

    return {
      products,
      categories,
    };
  }
}
