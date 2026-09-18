import type {
  LocalGroupMemberSelect,
  LocalGroupSelect,
  LocalMemberSelect,
  LocalOrganizationSelect,
  LocalUserSelect,
} from "@fludge/db/local-schemas/shared.schema";

export type IamLastSyncedAtLocal = {
  user: LocalUserSelect | null;
  organization: LocalOrganizationSelect | null;
  group: LocalGroupSelect | null;
  member: LocalMemberSelect | null;
  groupMember: LocalGroupMemberSelect | null;
};

export type SyncIamAllItems = {
  users: LocalUserSelect[];
  groups: LocalGroupSelect[];
  members: LocalMemberSelect[];
  organizations: LocalOrganizationSelect[];
  groupMembers: LocalGroupMemberSelect[];
};

export type IamLastSyncedAtQuery = {
  user: Date | null;
  group: Date | null;
  member: Date | null;
  organization: Date | null;
  groupMember: Date | null;
};
