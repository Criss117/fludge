import type {
  LocalGroup,
  LocalGroupMember,
  LocalMember,
  LocalOrganization,
  LocalUser,
} from "@fludge/sync/entities/iam.entities";
import type {
  IamLastSyncedAt,
  SyncIamAllItems,
} from "./server-sync-iam.repository";

export type GetIamLastSyncedAt = {
  user: LocalUser | null;
  organization: LocalOrganization | null;
  group: LocalGroup | null;
  member: LocalMember | null;
  groupMember: LocalGroupMember | null;
};

export interface ClientSyncIamRepository {
  getLastSyncedAt: () => Promise<GetIamLastSyncedAt>;

  saveAll: (values: SyncIamAllItems) => Promise<void>;
}

export interface HttpClientSyncIamRepository {
  findLastSyncedAt: (lastSyncedAt: IamLastSyncedAt) => Promise<SyncIamAllItems>;
}
