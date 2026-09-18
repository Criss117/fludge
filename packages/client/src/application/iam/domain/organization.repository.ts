import type {
  LocalGroupMemberSelect,
  LocalGroupSelect,
  LocalMemberSelect,
  LocalOrganizationSelect,
} from "@fludge/db/local-schemas/shared.schema";

export type OrganizationDetail = LocalOrganizationSelect & {
  members: LocalMemberSelect[];
  groups: LocalGroupSelect[];
  groupMembers: LocalGroupMemberSelect[];
};

export interface OrganizationRepository {
  findAll(): Promise<LocalOrganizationSelect[]>;
  save(organization: OrganizationDetail | OrganizationDetail[]): Promise<void>;
  delete(organizationId: string | string[]): Promise<void>;
}
