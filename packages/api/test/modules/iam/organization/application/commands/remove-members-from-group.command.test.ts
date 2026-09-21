import { describe, expect, it } from "bun:test";

import { RemoveMembersFromGroupCommand } from "@fludge/api/modules/iam/organization/application/commands/remove-members-from-group.command";
import { GroupMemberNotFoundException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-member-not-found.exception";
import { InMemoryGroupMemberRepository } from "@test/support/repositories/in-memory-group-member.repository";
import {
  buildOrganization,
  addGroupToOrganization,
  addMemberToOrganization,
} from "@test/support/builders/organization.builder";
import { GroupMember } from "@fludge/api/modules/iam/organization/domain/entities/group-member.entity";

function setup() {
  const repository = new InMemoryGroupMemberRepository();
  const command = new RemoveMembersFromGroupCommand(repository);

  return { repository, command };
}

describe("RemoveMembersFromGroupCommand", () => {
  it("removes members from a group and deletes the relations", async () => {
    const { command, repository } = setup();
    const { org } = buildOrganization();
    const group = addGroupToOrganization(org, { name: "Ventas" });
    const m1 = addMemberToOrganization(org);
    const m2 = addMemberToOrganization(org);
    const ownerId = org.members.owner!.id.toString();

    for (const member of [m1, m2]) {
      org.addGroupMember(
        GroupMember.create({
          groupId: group.id.toString(),
          memberId: member.id.toString(),
          createdBy: ownerId,
        }),
      );
    }
    repository.save(org.id.toString(), org.groupMembers);

    const result = await command.execute(org, {
      groupId: group.id.toString(),
      memberIds: [m1.id.toString()],
    });

    expect(result.groupMembers).toHaveLength(1);
    expect(repository.getAll(org.id.toString())).toHaveLength(1);
  });

  it("throws GroupMemberNotFoundException when the relation does not exist", async () => {
    const { command } = setup();
    const { org } = buildOrganization();
    const group = addGroupToOrganization(org, { name: "Ventas" });
    const member = addMemberToOrganization(org);

    await expect(
      command.execute(org, {
        groupId: group.id.toString(),
        memberIds: [member.id.toString()],
      }),
    ).rejects.toThrow(GroupMemberNotFoundException);
  });
});