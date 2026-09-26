import type {
  LocalGroup,
  LocalMember,
  LocalOrganization,
  LocalUser,
} from "@fludge/db/local-schemas/shared.schema";

export type OrganizationSummary = LocalOrganization;

export type MemberSummary = LocalMember & {
  user: LocalUser;
};
export type GroupSummary = Omit<LocalGroup, "members"> & {
  totalMembers: number;
};

export type GroupDetail = Omit<LocalGroup, "members"> & {
  members: MemberSummary[];
};

export type MemberDetail = MemberSummary & {
  groups: GroupSummary[];
};
