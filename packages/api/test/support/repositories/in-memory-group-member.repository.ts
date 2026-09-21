import { ok, type Result } from "@fludge/utils/trycatch";
import { GroupMember } from "@fludge/api/modules/iam/organization/domain/entities/group-member.entity";
import type { GroupMemberRepository } from "@fludge/api/modules/iam/organization/domain/repositories/group-member.repository";
import type { TransactionService } from "@fludge/db";

/**
 * Test double de GroupMemberRepository.
 * Guarda las relaciones en un Map en memoria keyed por `${organizationId}:${groupId}:${memberId}`.
 */
export class InMemoryGroupMemberRepository implements GroupMemberRepository {
  private readonly store = new Map<string, GroupMember>();

  private key(organizationId: string, gm: GroupMember): string {
    return `${organizationId}:${gm.groupId.toString()}:${gm.memberId.toString()}`;
  }

  public getAll(organizationId?: string): GroupMember[] {
    const all = Array.from(this.store.values());

    return organizationId
      ? all.filter((gm) => this.store.has(this.key(organizationId, gm)))
      : all;
  }

  public clear(): void {
    this.store.clear();
  }

  public async save(
    organizationId: string,
    groupMembersValues: GroupMember | GroupMember[],
    _options?: { tx?: TransactionService },
  ): Promise<Result<undefined, Error>> {
    const groupMembers = Array.isArray(groupMembersValues)
      ? groupMembersValues
      : [groupMembersValues];

    for (const gm of groupMembers) {
      this.store.set(this.key(organizationId, gm), gm);
    }

    return ok(undefined);
  }

  public async delete(
    organizationId: string,
    groupMembersValues: GroupMember | GroupMember[],
    _options?: { tx?: TransactionService },
  ): Promise<Result<undefined, Error>> {
    const groupMembers = Array.isArray(groupMembersValues)
      ? groupMembersValues
      : [groupMembersValues];

    for (const gm of groupMembers) {
      this.store.delete(this.key(organizationId, gm));
    }

    return ok(undefined);
  }
}