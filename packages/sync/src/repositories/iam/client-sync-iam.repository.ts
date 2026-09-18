import type {
  IamLastSyncedAtLocal,
  IamLastSyncedAtQuery,
  SyncIamAllItems,
} from "@fludge/sync/types/iam.types";

export interface ClientSyncIamRepository {
  getLastSyncedAt: () => Promise<IamLastSyncedAtLocal>;

  saveAll: (values: SyncIamAllItems) => Promise<void>;
}

export interface HttpClientSyncIamRepository {
  findLastSyncedAt: (
    lastSyncedAt: IamLastSyncedAtQuery,
  ) => Promise<SyncIamAllItems>;
}
