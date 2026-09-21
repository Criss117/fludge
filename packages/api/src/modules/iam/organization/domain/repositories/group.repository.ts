import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { Group } from "../entities/group.entity";

export interface GroupRepository {
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

  transaction<T>(fn: (tx: TransactionService) => Promise<T>): Promise<Result<T, Error>>;
}
