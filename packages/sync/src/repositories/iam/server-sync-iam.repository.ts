import type {
  IamLastSyncedAtQuery,
  SyncIamAllItems,
} from "@fludge/sync/types/iam.types";

export interface ServerSyncIamRepository {
  findAllItems: (
    organizationIds: string[],
    lastSyncedAt: IamLastSyncedAtQuery,
  ) => Promise<SyncIamAllItems>;
}
