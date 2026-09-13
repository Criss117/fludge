import type {
  LocalGroup,
  LocalMember,
  LocalOrganization,
  LocalUser,
} from "@fludge/sync/entities/iam.entities";

export type IamLastSyncedAt = {
  user: Date | null;
  group: Date | null;
  member: Date | null;
  organization: Date | null;
};

type AllItems = {
  users: LocalUser[];
  groups: LocalGroup[];
  members: LocalMember[];
  organizations: LocalOrganization[];
};

export interface LocalClientIamRepository {
  getLastSyncedAt: () => Promise<{
    user: LocalUser | null;
    group: LocalGroup | null;
    member: LocalMember | null;
    organization: LocalOrganization | null;
  }>;

  saveAll: (values: AllItems) => Promise<void>;
}

export interface HttpClientIamRepository {
  findLastSyncedAt: (lastSyncedAt: IamLastSyncedAt) => Promise<AllItems>;
}
