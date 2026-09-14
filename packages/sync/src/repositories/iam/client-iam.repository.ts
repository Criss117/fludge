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

type AllItems = {
  users: LocalUser[];
  groups: LocalGroup[];
  members: LocalMember[];
  organizations: LocalOrganization[];
  groupMembers: LocalGroupMember[];
};

export interface LocalClientIamRepository {
  getLastSyncedAt: () => Promise<{
    user: LocalUser | null;
    organization: LocalOrganization | null;
    group: LocalGroup | null;
    member: LocalMember | null;
    groupMember: LocalGroupMember | null;
  }>;

  saveAll: (values: AllItems) => Promise<void>;
}

export interface HttpClientIamRepository {
  findLastSyncedAt: (lastSyncedAt: IamLastSyncedAt) => Promise<AllItems>;
}
