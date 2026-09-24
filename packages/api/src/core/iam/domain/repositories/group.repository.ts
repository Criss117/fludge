import type { Result } from "@fludge/utils/trycatch";
import type { Group } from "../entities/group.entity";
import type { TransactionService } from "@fludge/db";
import type { TransactionalRepository } from "@fludge/api/core/shared/repositories/transactional-repository";

export type Options = {
  tx?: TransactionService;
};

export interface GroupRepository extends TransactionalRepository {
  findById(
    organizationId: string,
    groupId: string,
  ): Promise<Result<Group | null>>;

  findByIds(
    organizationId: string,
    groupIds: string[],
  ): Promise<Result<Group[]>>;

  saveOnlyGroup(
    groups: Group | Group[],
    options?: Options,
  ): Promise<Result<void>>;

  save(group: Group | Group[]): Promise<Result<void>>;

  delete(groups: Group | Group[]): Promise<Result<void>>;
}
