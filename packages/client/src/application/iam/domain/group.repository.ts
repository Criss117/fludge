import type { LocalGroup } from "@fludge/sync/entities/iam.entities";
import type { MemberSummary } from "./member.repository";

export type GroupSummary = LocalGroup;

export type GroupDetail = GroupSummary & {
  members: MemberSummary[];
};

export type FindAllGroupsFilters = {
  searchQuery?: string;
  excludeIds?: string[];
};

export function normalizeFilters(filters?: FindAllGroupsFilters) {
  return {
    searchQuery: filters?.searchQuery?.trim() || undefined,
    excludeIds: filters?.excludeIds?.length
      ? [...filters.excludeIds].sort()
      : undefined,
  };
}

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

  delete(organizationId: string, groupId: string | string[]): Promise<void>;
}
