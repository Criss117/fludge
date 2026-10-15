import type {
  CommerceSyncCursors,
  CommerceSyncResult,
} from "@fludge/sync/types/commerce.types";

export interface ClientSyncCommerceRepository {
  getLastSyncedAt: () => Promise<CommerceSyncCursors>;

  saveAll: (values: CommerceSyncResult) => Promise<void>;
}

export interface HttpClientSyncCommerceRepository {
  findLastSyncedAt: (
    lastSyncedAt: CommerceSyncCursors,
  ) => Promise<CommerceSyncResult>;
}
