import type {
  IamLastSyncedAtLocal,
  IamLastSyncedAtQuery,
  IamSyncAllItems,
} from "@fludge/sync/types/iam.types";

export interface ClientSyncIamRepository {
  getLastSyncedAt: () => Promise<IamLastSyncedAtLocal>;

  saveAll: (values: IamSyncAllItems) => Promise<void>;
}

export interface HttpClientSyncIamRepository {
  findLastSyncedAt: (
    lastSyncedAt: IamLastSyncedAtQuery,
  ) => Promise<IamSyncAllItems>;
}
