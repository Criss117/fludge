import type { Result } from "@fludge/utils/trycatch";
import type { Group } from "../entities/group.entity";
import type { TransactionService } from "@fludge/db";
import type { TransactionalRepository } from "@fludge/api/core/shared/repositories/transactional-repository";

export type Options = {
  tx?: TransactionService;
};

export interface GroupRepository extends TransactionalRepository {
  findById(groupId: string): Promise<Result<Group | null>>;

  findByIds(
    groupIds: string[],
    organizationId: string,
  ): Promise<Result<Group[]>>;

  insert(group: Group, options?: Options): Promise<Result<void>>;

  insertMany(groups: Group[], options?: Options): Promise<Result<void>>;

  update(group: Group): Promise<Result<void>>;

  delete(
    organizationId: string,
    groupIds: string[],
    options?: Options,
  ): Promise<Result<void>>;
}
