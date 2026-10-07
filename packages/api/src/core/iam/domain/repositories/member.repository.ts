import type { Result } from "@fludge/utils/trycatch";
import type { Member } from "@fludge/api/core/iam/domain/entities/member.entity";
import type { TransactionService } from "@fludge/db";
import type { UserSelect } from "@fludge/db/schema/auth.schema";

export type Options = {
  tx?: TransactionService;
};

export interface MemberRepository {
  findUser(userId: string): Promise<Result<UserSelect | null>>;

  findById(
    organizationId: string,
    memberId: string,
  ): Promise<Result<Member | null>>;

  findByIds(
    organizationId: string,
    memberIds: string[],
  ): Promise<Result<Member[]>>;

  findByUserId(
    organizationId: string,
    userId: string,
  ): Promise<Result<Member | null>>;

  save(member: Member | Member[], options?: Options): Promise<Result<void>>;
}
