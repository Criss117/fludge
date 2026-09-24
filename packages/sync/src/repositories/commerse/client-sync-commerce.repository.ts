import type {
  CommerceLastSyncedAt,
  CommerceSyncResult,
} from "@fludge/sync/types/commerce.types";

export interface ClientSyncCommerceRepository {
  getLastSyncedAt: () => Promise<CommerceLastSyncedAt>;

  saveAll: (values: CommerceSyncResult) => Promise<void>;
}

export interface HttpClientSyncCommerceRepository {
  findLastSyncedAt: (
    lastSyncedAt: CommerceLastSyncedAt,
  ) => Promise<CommerceSyncResult>;
}
