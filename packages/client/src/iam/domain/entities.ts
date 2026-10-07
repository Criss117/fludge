import type {
  LocalGroup,
  LocalMember,
  LocalOrganization,
} from "@fludge/db/local-schemas/shared.schema";

export type OrganizationSummary = LocalOrganization;
export type MemberSummary = LocalMember;

export type GroupSummary = Omit<LocalGroup, "members"> & {
  totalMembers: number;
};

export type GroupDetail = Omit<LocalGroup, "members"> & {
  members: LocalMember[];
};

export type MemberDetail = LocalMember & {
  groups: GroupSummary[];
};
