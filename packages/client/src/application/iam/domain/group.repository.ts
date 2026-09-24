import type { LocalGroup } from "@fludge/db/local-schemas/shared.schema";
import type { MemberSummary } from "./member.repository";

export type GroupSummary = LocalGroup;

export type GroupDetail = Omit<GroupSummary, "members"> & {
  members: MemberSummary[];
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
