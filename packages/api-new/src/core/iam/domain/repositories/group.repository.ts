import type { Result } from "@fludge/utils/trycatch";
import type { Group } from "../entities/group.entity";
import type { TransactionService } from "@fludge/db";
import type { TransactionalRepository } from "@core/shared/repositories/transactional-repository";

export type Options = {
  tx?: TransactionService;
};

export interface GroupRepository extends TransactionalRepository {
  findById(groupId: string): Promise<Result<Group | null>>;

  insert(group: Group, options?: Options): Promise<Result<void>>;

  update(group: Group): Promise<Result<void>>;

  delete(
    organizationId: string,
    groupIds: string[],
    options?: Options,
  ): Promise<Result<void>>;
}
