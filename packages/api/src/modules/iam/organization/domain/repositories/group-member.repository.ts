import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { GroupMember } from "../entities/group-member.entity";

export interface GroupMemberRepository {
  save(
    organizationId: string,
    groupMembersValues: GroupMember | GroupMember[],
    options?: { tx?: TransactionService },
  ): Promise<Result<undefined, Error>>;

  delete(
    organizationId: string,
    groupMembersValues: GroupMember | GroupMember[],
    options?: { tx?: TransactionService },
  ): Promise<Result<undefined, Error>>;
}
