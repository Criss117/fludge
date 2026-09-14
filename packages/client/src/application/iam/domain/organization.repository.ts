import type {
  LocalGroup,
  LocalGroupMember,
  LocalMember,
  LocalOrganization,
} from "@fludge/sync/entities/iam.entities";

export type OrganizationDetail = LocalOrganization & {
  members: LocalMember[];
  groups: LocalGroup[];
  groupMembers: LocalGroupMember[];
};

export interface OrganizationRepository {
  findAll(): Promise<LocalOrganization[]>;
  save(organization: OrganizationDetail): Promise<void>;
}
