import type { Result } from "@fludge/utils/trycatch";
import type { Group } from "../entities/group.entity";
import type { TransactionService } from "@fludge/db";

export type Options = {
  tx?: TransactionService;
};

export interface GroupRepository {
  findById(groupId: string): Promise<Result<Group | null>>;

  insert(group: Group, options?: Options): Promise<Result<void>>;

  update(group: Group): Promise<Result<void>>;
}
