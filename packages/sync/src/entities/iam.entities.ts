import type {
  UserSelect,
  GroupSelect,
  MemberSelect,
  OrganizationSelect,
} from "@fludge/db/local-schemas/iam.schema";

export type LocalUser = UserSelect;
export type LocalGroup = GroupSelect;
export type LocalMember = MemberSelect;
export type LocalOrganization = OrganizationSelect;
