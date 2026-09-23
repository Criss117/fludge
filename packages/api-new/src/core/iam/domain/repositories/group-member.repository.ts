import type { Result } from "@fludge/utils/trycatch";
import type { GroupMember } from "../entities/group-member.entity";
import type { TransactionService } from "@fludge/db";

export type Options = {
  tx?: TransactionService;
};

export interface GroupMemberRepository {
  insert(
    groupMembers: GroupMember | GroupMember[],
    options?: Options,
  ): Promise<Result<void>>;

  delete(groupMember: GroupMember, options?: Options): Promise<Result<void>>;

  deleteByGroupIds(
    organizationId: string,
    groupIds: string[],
    options?: Options,
  ): Promise<Result<void>>;

  deleteByGroupAndMemberIds(
    organizationId: string,
    groupId: string,
    memberIds: string[],
    options?: Options,
  ): Promise<Result<void>>;
}