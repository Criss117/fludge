import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { Group } from "../entities/group.entity";
import type { ITransactionalRepository } from "@fludge/api/modules/shared/infrastructure/repositories/transactional-repository";

export interface GroupRepository extends ITransactionalRepository {
  save(
    organizationId: string,
    groupValues: Group | Group[],
    options?: { tx?: TransactionService },
  ): Promise<Result<undefined, Error>>;

  delete(
    organizationId: string,
    groupValues: Group | Group[],
    options?: { tx?: TransactionService },
  ): Promise<Result<undefined, Error>>;
}
