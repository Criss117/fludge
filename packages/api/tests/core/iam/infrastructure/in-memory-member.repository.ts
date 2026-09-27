import { ok } from "@fludge/utils/trycatch";
import type { Result } from "@fludge/utils/trycatch";
import type { Member } from "@fludge/api/core/iam/domain/entities/member.entity";
import type { MemberRepository, Options } from "@fludge/api/core/iam/domain/repositories/member.repository";

export class InMemoryMemberRepository implements MemberRepository {
  private members: Map<string, Member> = new Map();

  public get size() {
    return this.members.size;
  }

  async findById(_organizationId: string, memberId: string): Promise<Result<Member | null>> {
    const member = this.members.get(memberId);
    return ok(member ?? null);
  }

  async findByIds(_organizationId: string, memberIds: string[]): Promise<Result<Member[]>> {
    const found = memberIds
      .map((id) => this.members.get(id))
      .filter((member): member is Member => member !== undefined);
    return ok(found);
  }

  async findByUserId(userId: string, organizationId: string): Promise<Result<Member | null>> {
    for (const member of this.members.values()) {
      if (member.userId.toString() === userId && member.values.organizationId === organizationId) {
        return ok(member);
      }
    }
    return ok(null);
  }

  async save(member: Member | Member[], _options?: Options): Promise<Result<void>> {
    const members = Array.isArray(member) ? member : [member];
    for (const m of members) {
      this.members.set(m.id.toString(), m);
    }
    return ok(undefined);
  }

  clear() {
    this.members.clear();
  }
}