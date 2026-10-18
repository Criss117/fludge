import type { CommerceSyncCursors, CommerceSyncResult } from "@fludge/sync/types/commerce.types";
import type { RepositoryError } from "@fludge/utils/errors/repository.error";
import type { Result } from "@fludge/utils/trycatch";

export interface ClientSyncCommerceRepository {
  getLastSyncedAt: () => Promise<Result<CommerceSyncCursors, RepositoryError>>;

  saveAll: (values: CommerceSyncResult) => Promise<Result<void, RepositoryError>>;
}

export interface HttpClientSyncCommerceRepository {
  findLastSyncedAt: (
    lastSyncedAt: CommerceSyncCursors,
  ) => Promise<Result<CommerceSyncResult, RepositoryError>>;
}
