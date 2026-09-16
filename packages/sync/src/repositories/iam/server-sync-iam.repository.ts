import type {
  LocalGroup,
  LocalGroupMember,
  LocalMember,
  LocalOrganization,
  LocalUser,
} from "@fludge/sync/entities/iam.entities";

export type IamLastSyncedAt = {
  user: Date | null;
  group: Date | null;
  member: Date | null;
  organization: Date | null;
  groupMember: Date | null;
};

export type SyncIamAllItems = {
  users: LocalUser[];
  groups: LocalGroup[];
  members: LocalMember[];
  organizations: LocalOrganization[];
  groupMembers: LocalGroupMember[];
};

export interface ServerSyncIamRepository {
  findAllItems: (
    organizationIds: string[],
    lastSyncedAt: IamLastSyncedAt,
  ) => Promise<SyncIamAllItems>;
}
