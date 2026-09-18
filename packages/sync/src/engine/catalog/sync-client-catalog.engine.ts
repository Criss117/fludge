import type {
  ClientSyncCatalogRepository,
  HttpClientSyncCatalogRepository,
} from "@fludge/sync/repositories/catalog/client-sync-catalog.repository";
import type { CatalogLastSyncedAtQuery } from "@fludge/sync/types/catalog.types";

export class SyncClientCatalogEngine {
  constructor(
    private readonly clientSyncCatalogRepository: ClientSyncCatalogRepository,
    private readonly httpClientSyncCatalogRepository: HttpClientSyncCatalogRepository,
  ) {}

  public async getLastSyncedAt(): Promise<CatalogLastSyncedAtQuery> {
    const { category, product } =
      await this.clientSyncCatalogRepository.getLastSyncedAt();

    return {
      product: product?.updatedAt ?? null,
      category: category?.updatedAt ?? null,
    };
  }

  public async sync(lastSyncedAt: CatalogLastSyncedAtQuery) {
    const { products, categories } =
      await this.httpClientSyncCatalogRepository.findLastSyncedAt(lastSyncedAt);

    await this.clientSyncCatalogRepository.saveAll({
      products,
      categories,
    });
  }
}
