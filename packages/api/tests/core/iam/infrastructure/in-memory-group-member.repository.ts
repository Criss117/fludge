import { ok } from "@fludge/utils/trycatch";
import type { Result } from "@fludge/utils/trycatch";
import type { GroupMember } from "@fludge/api/core/iam/domain/entities/group-member.entity";
import type { GroupMemberRepository, Options } from "@fludge/api/core/iam/domain/repositories/group-member.repository";

export class InMemoryGroupMemberRepository implements GroupMemberRepository {
  private groupMembers: Map<string, GroupMember> = new Map();

  public get size() {
    return this.groupMembers.size;
  }

  private key(gm: GroupMember) {
    return `${gm.groupId.toString()}-${gm.memberId.toString()}`;
  }

  async delete(
    groupMember: GroupMember | GroupMember[],
    _options?: Options,
  ): Promise<Result<void>> {
    const items = Array.isArray(groupMember) ? groupMember : [groupMember];
    for (const gm of items) {
      this.groupMembers.delete(this.key(gm));
    }
    return ok(undefined);
  }

  async deleteByGroupIds(
    _organizationId: string,
    groupIds: string[],
    _options?: Options,
  ): Promise<Result<void>> {
    for (const [key, gm] of this.groupMembers) {
      if (groupIds.includes(gm.groupId.toString())) {
        this.groupMembers.delete(key);
      }
    }
    return ok(undefined);
  }

  clear() {
    this.groupMembers.clear();
  }
}