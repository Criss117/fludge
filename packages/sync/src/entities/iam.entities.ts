import type {
  UserSelect,
  GroupSelect,
  MemberSelect,
  OrganizationSelect,
  GroupMemberSelect,
} from "@fludge/db/local-schemas/iam.schema";

export type LocalUser = UserSelect;
export type LocalGroup = GroupSelect;
export type LocalMember = MemberSelect;
export type LocalGroupMember = GroupMemberSelect;
export type LocalOrganization = OrganizationSelect;
