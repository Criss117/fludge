import type {
  LocalGroup,
  LocalMember,
  LocalUser,
} from "@fludge/db/local-schemas/shared.schema";

export type GroupSummary = LocalGroup;

export type GroupDetail = Omit<GroupSummary, "members"> & {
  members: (LocalMember & {
    user: LocalUser;
  })[];
};

export type FindAllGroupsFilters = {
  searchQuery?: string;
  excludeIds?: string[];
};

export interface GroupRepository {
  findAll(
    organizationId: string,
    filters?: FindAllGroupsFilters,
  ): Promise<GroupSummary[]>;

  findOneById(
    organizationId: string,
    groupId: string,
  ): Promise<GroupDetail | null>;

  save(group: LocalGroup | LocalGroup[]): Promise<void>;

  delete(group: LocalGroup | LocalGroup[]): Promise<void>;
}
