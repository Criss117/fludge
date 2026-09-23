import type { Result } from "@fludge/utils/trycatch";
import type { Member } from "../../../iam/domain/entities/member.entity";
import type { TransactionService } from "@fludge/db";

export type Options = {
  tx?: TransactionService;
};

export interface MemberRepository {
  findById(memberId: string): Promise<Result<Member | null>>;

  findByIds(
    memberIds: string[],
    organizationId: string,
  ): Promise<Result<Member[]>>;

  findByUserId(
    userId: string,
    organizationId: string,
  ): Promise<Result<Member | null>>;

  insert(member: Member, options?: Options): Promise<Result<void>>;

  update(member: Member): Promise<Result<void>>;
}