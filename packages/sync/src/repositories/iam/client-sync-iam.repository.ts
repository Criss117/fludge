import type { IamSyncCursors, IamSyncResult } from "@fludge/sync/types/iam.types";
import type { RepositoryError } from "@fludge/utils/errors/repository.error";
import type { Result } from "@fludge/utils/trycatch";

/**
 * Client-side sync repository for IAM.
 * Obtiene los timestamps locales más recientes y persiste los datos del servidor.
 */
export interface ClientSyncIamRepository {
  getLastSyncedAt(): Promise<Result<IamSyncCursors, RepositoryError>>;

  saveAll(values: IamSyncResult): Promise<Result<void, RepositoryError>>;
}

/**
 * HTTP client para llamar al server sync endpoint.
 */
export interface HttpClientSyncIamRepository {
  findLastSyncedAt(lastSyncedAt: IamSyncCursors): Promise<Result<IamSyncResult, RepositoryError>>;
}
