import type { CatalogSyncCursors, CatalogSyncResult } from "@fludge/sync/types/catalog.types";
import type { RepositoryError } from "@fludge/utils/errors/repository.error";
import type { Result } from "@fludge/utils/trycatch";

export interface ClientSyncCatalogRepository {
  getLastSyncedAt(): Promise<Result<CatalogSyncCursors, RepositoryError>>;

  saveAll(values: CatalogSyncResult): Promise<Result<void, RepositoryError>>;
}

export interface HttpClientSyncCatalogRepository {
  findLastSyncedAt(
    lastSyncedAt: CatalogSyncCursors,
  ): Promise<Result<CatalogSyncResult, RepositoryError>>;
}
