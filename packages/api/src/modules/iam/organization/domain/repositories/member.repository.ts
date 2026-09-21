import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { Member } from "../entities/member.entity";

export interface MemberRepository {
  save(
    organizationId: string,
    membersValues: Member | Member[],
    options?: { tx?: TransactionService },
  ): Promise<Result<undefined, Error>>;
}
