import type { IamLastSyncedAt, IamSyncResult } from "@fludge/sync/types/iam.types";

/**
 * Client-side sync repository for IAM.
 * Obtiene los timestamps locales más recientes y persiste los datos del servidor.
 */
export interface ClientSyncIamRepository {
  getLastSyncedAt(): Promise<IamLastSyncedAt>;

  saveAll(values: IamSyncResult): Promise<void>;
}

/**
 * HTTP client para llamar al server sync endpoint.
 */
export interface HttpClientSyncIamRepository {
  findLastSyncedAt(
    lastSyncedAt: IamLastSyncedAt,
  ): Promise<IamSyncResult>;
}
