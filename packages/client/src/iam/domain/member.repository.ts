import type { LocalMember } from "@fludge/db/local-schemas/shared.schema";
import type { RepositoryError } from "@fludge/utils/errors/repository.error";
import type { Result } from "@fludge/utils/trycatch";

import type { MemberDetail, MemberSummary } from "./entities";

export type FindAllMembersFilters = {
  searchQuery?: string;
  excludeIds?: string[];
};

export interface MemberRepository {
  findAll(
    organizationId: string,
    filters?: FindAllMembersFilters,
  ): Promise<Result<MemberSummary[], RepositoryError>>;

  findOneById(
    organizationId: string,
    memberId: string,
  ): Promise<Result<MemberDetail | null, RepositoryError>>;

  save(member: LocalMember | LocalMember[]): Promise<Result<void, RepositoryError>>;

  delete(
    organizationId: string,
    memberIds: string | string[],
  ): Promise<Result<void, RepositoryError>>;

  clearAll(): Promise<Result<void, RepositoryError>>;
}
