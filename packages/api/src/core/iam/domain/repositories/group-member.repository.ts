import type { TransactionService } from "@fludge/db";
import type { Result } from "@fludge/utils/trycatch";

import type { GroupMember } from "../entities/group-member.entity";

export type Options = {
  tx?: TransactionService;
};

export interface GroupMemberRepository {
  delete(groupMember: GroupMember | GroupMember[], options?: Options): Promise<Result<void>>;

  deleteByGroupIds(
    organizationId: string,
    groupIds: string[],
    options?: Options,
  ): Promise<Result<void>>;
}
