import { describe, expect, it } from "bun:test";

import { AddMemberCommand } from "@fludge/api/modules/iam/organization/application/commands/add-member.command";
import { InMemoryMemberRepository } from "@test/support/repositories/in-memory-member.repository";
import {
  buildOrganization,
  addMemberToOrganization,
} from "@test/support/builders/organization.builder";
import { UUID } from "@fludge/utils/uuid";

function setup() {
  const repository = new InMemoryMemberRepository();
  const command = new AddMemberCommand(repository);

  return { repository, command };
}

describe("AddMemberCommand", () => {
  it("adds a member with role member and persists it", async () => {
    const { command, repository } = setup();
    const { org, ownerUserId } = buildOrganization();
    const newUserId = UUID.generate().toString();

    const result = await command.execute(ownerUserId, org, {
      userId: newUserId,
    });

    expect(result.members).toHaveLength(2);
    expect(repository.getAll(org.id.toString())).toHaveLength(1);

    const added = result.members.find((m) => m.userId === newUserId)!;
    expect(added.role).toBe("member");
  });

  it("assigns the logged member as assignedBy", async () => {
    const { command } = setup();
    const { org, ownerUserId } = buildOrganization();
    const newUserId = UUID.generate().toString();

    const result = await command.execute(ownerUserId, org, {
      userId: newUserId,
    });

    const loggedMember = org.members.getMemberByUserId(
      UUID.fromString(ownerUserId),
    )!;
    const added = result.members.find((m) => m.userId === newUserId)!;
    expect(added.assignedBy).toBe(loggedMember.id.toString());
  });

  it("does not block a repeated userId at domain level (uniqueness is delegated to DB upsert)", async () => {
    const { command } = setup();
    const { org, ownerUserId } = buildOrganization();
    const member = addMemberToOrganization(org);

    // Member.create genera un id nuevo, y la colección valida por id de member
    // (o segundo owner), no por userId. La unicidad real (organizationId, userId)
    // se resuelve en la BD con onConflictDoUpdate.
    const before = org.members.all.length;

    const result = await command.execute(ownerUserId, org, {
      userId: member.userId.toString(),
    });

    expect(result.members).toHaveLength(before + 1);
  });
});
