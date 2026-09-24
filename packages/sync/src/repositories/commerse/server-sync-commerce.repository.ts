import type {
  CommerceLastSyncedAt,
  CommerceSyncResult,
} from "@fludge/sync/types/commerce.types";

export interface ServerSyncCommerceRepository {
  findAllItems(
    organizationIds: string[],
    lastSyncedAt: CommerceLastSyncedAt,
  ): Promise<CommerceSyncResult>;
}
