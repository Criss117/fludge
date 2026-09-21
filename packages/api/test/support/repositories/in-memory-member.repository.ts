import { ok, type Result } from "@fludge/utils/trycatch";
import { Member } from "@fludge/api/modules/iam/organization/domain/entities/member.entity";
import type { MemberRepository } from "@fludge/api/modules/iam/organization/domain/repositories/member.repository";
import type { TransactionService } from "@fludge/db";

/**
 * Test double de MemberRepository.
 * Guarda los miembros en un Map en memoria keyed por `${organizationId}:${memberId}`.
 */
export class InMemoryMemberRepository implements MemberRepository {
  private readonly store = new Map<string, Member>();

  private key(organizationId: string, memberId: string): string {
    return `${organizationId}:${memberId}`;
  }

  public getAll(organizationId?: string): Member[] {
    const members = Array.from(this.store.values());

    return organizationId
      ? members.filter((m) =>
          this.store.has(this.key(organizationId, m.id.toString())),
        )
      : members;
  }

  public clear(): void {
    this.store.clear();
  }

  public async save(
    organizationId: string,
    membersValues: Member | Member[],
    _options?: { tx?: TransactionService },
  ): Promise<Result<undefined, Error>> {
    const members = Array.isArray(membersValues) ? membersValues : [membersValues];

    for (const member of members) {
      this.store.set(this.key(organizationId, member.id.toString()), member);
    }

    return ok(undefined);
  }
}