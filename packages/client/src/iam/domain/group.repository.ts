import type { LocalGroup } from "@fludge/db/local-schemas/shared.schema";
import type { RepositoryError } from "@fludge/utils/errors/repository.error";
import type { Result } from "@fludge/utils/trycatch";

import type { GroupDetail, GroupSummary } from "./entities";

export type FindAllGroupsFilters = {
  searchQuery?: string;
  excludeIds?: string[];
};

export interface GroupRepository {
  findAll(
    organizationId: string,
    filters?: FindAllGroupsFilters,
  ): Promise<Result<GroupSummary[], RepositoryError>>;

  findOneById(
    organizationId: string,
    groupId: string,
  ): Promise<Result<GroupDetail | null, RepositoryError>>;

  save(group: LocalGroup | LocalGroup[]): Promise<Result<void, RepositoryError>>;

  delete(group: LocalGroup | LocalGroup[]): Promise<Result<void, RepositoryError>>;

  clearAll(): Promise<Result<void, RepositoryError>>;
}
