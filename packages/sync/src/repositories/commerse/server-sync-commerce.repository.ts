import type {
  CommerceSyncCursors,
  CommerceSyncResult,
} from "@fludge/sync/types/commerce.types";

export interface ServerSyncCommerceRepository {
  findAllItems(
    organizationIds: string[],
    cursors: CommerceSyncCursors,
    limit?: number,
  ): Promise<CommerceSyncResult>;
}
