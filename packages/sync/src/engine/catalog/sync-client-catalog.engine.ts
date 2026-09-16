import type {
  ClientSyncCatalogRepository,
  HttpClientSyncCatalogRepository,
} from "@fludge/sync/repositories/catalog/client-sync-catalog.repository";
import type { CatalogLastSyncedAt } from "@fludge/sync/repositories/catalog/server-sync-catalog.repository";

export class SyncClientCatalogEngine {
  constructor(
    private readonly clientSyncCatalogRepository: ClientSyncCatalogRepository,
    private readonly httpClientSyncCatalogRepository: HttpClientSyncCatalogRepository,
  ) {}

  public async getLastSyncedAt(): Promise<CatalogLastSyncedAt> {
    const { category, product } =
      await this.clientSyncCatalogRepository.getLastSyncedAt();

    return {
      product: product?.updatedAt ?? null,
      category: category?.updatedAt ?? null,
    };
  }

  public async sync(lastSyncedAt: CatalogLastSyncedAt) {
    const { products, categories } =
      await this.httpClientSyncCatalogRepository.findLastSyncedAt(lastSyncedAt);

    await this.clientSyncCatalogRepository.saveAll({
      products,
      categories,
    });
  }
}
