import type {
  CatalogLastSyncedAt,
  HttpClientCatalogRepository,
  LocalClientCatalogRepository,
} from "@fludge/sync/repositories/catalog/client-catalog.repository";

export class SyncClientCatalogEngine {
  constructor(
    private readonly localClientCatalogRepository: LocalClientCatalogRepository,
    private readonly httpClientCatalogRepository: HttpClientCatalogRepository,
  ) {}

  public async getLastSyncedAt(): Promise<CatalogLastSyncedAt> {
    const { category, product } =
      await this.localClientCatalogRepository.getLastSyncedAt();

    return {
      product: product?.updatedAt ?? null,
      category: category?.updatedAt ?? null,
    };
  }

  public async sync(lastSyncedAt: CatalogLastSyncedAt) {
    const { products, categories } =
      await this.httpClientCatalogRepository.findLastSyncedAt(lastSyncedAt);

    await this.localClientCatalogRepository.saveAll({
      products,
      categories,
    });
  }
}
