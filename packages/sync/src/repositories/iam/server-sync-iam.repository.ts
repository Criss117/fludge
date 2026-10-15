import type {
  IamSyncCursors,
  IamSyncResult,
} from "@fludge/sync/types/iam.types";

/**
 * Server-side sync repository for IAM.
 * Recibe los timestamps más recientes del cliente y retorna
 * las entidades que cambiaron desde esas fechas.
 */
export interface ServerSyncIamRepository {
  findAllByUpdatedAt(
    organizationIds: string[],
    cursors: IamSyncCursors,
    limit?: number,
  ): Promise<IamSyncResult>;
}
