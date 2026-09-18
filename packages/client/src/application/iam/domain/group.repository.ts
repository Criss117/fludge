import type { LocalGroupSelect } from "@fludge/db/local-schemas/shared.schema";
import type { MemberSummary } from "./member.repository";

export type GroupSummary = LocalGroupSelect;

export type GroupDetail = GroupSummary & {
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

  save(group: LocalGroupSelect | LocalGroupSelect[]): Promise<void>;

  delete(organizationId: string, groupId: string | string[]): Promise<void>;
}
