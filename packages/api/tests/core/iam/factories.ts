import { Member } from "@fludge/api/core/iam/domain/entities/member.entity";
import { UserAuthContext } from "@fludge/api/core/iam/domain/entities/user-auth-context.entity";
import { UUID } from "@fludge/utils/uuid";

export function makeMember(overrides?: Partial<Parameters<typeof Member.create>[0]>) {
  return Member.create({
    userId: UUID.generate(),
    assignedBy: null,
    role: "member",
    organizationId: UUID.generate(),
    ...overrides,
  });
}

export function makeOwner(overrides?: Partial<Parameters<typeof Member.create>[0]>) {
  return Member.create({
    userId: UUID.generate(),
    assignedBy: null,
    role: "owner",
    organizationId: UUID.generate(),
    ...overrides,
  });
}

export function makeAuthContext(overrides?: { member?: Member; organizationId?: UUID; groups?: any[] }) {
  const member = overrides?.member ?? makeMember();
  return UserAuthContext.create({
    organizationId: overrides?.organizationId ?? UUID.fromString(member.values.organizationId),
    member,
    groups: overrides?.groups ?? [],
  });
}