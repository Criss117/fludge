import { describe, expect, it } from "bun:test";

import { RemoveGroupsFromMemberCommand } from "@fludge/api/modules/iam/organization/application/commands/remove-groups-from-member.command";
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
  const command = new RemoveGroupsFromMemberCommand(repository);

  return { repository, command };
}

describe("RemoveGroupsFromMemberCommand", () => {
  it("removes groups from a member and deletes the relations", async () => {
    const { command, repository } = setup();
    const { org } = buildOrganization();
    const g1 = addGroupToOrganization(org, { name: "Ventas" });
    const g2 = addGroupToOrganization(org, { name: "Compras" });
    const member = addMemberToOrganization(org);
    const ownerId = org.members.owner!.id.toString();

    for (const group of [g1, g2]) {
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
      memberId: member.id.toString(),
      groupIds: [g1.id.toString()],
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
        memberId: member.id.toString(),
        groupIds: [group.id.toString()],
      }),
    ).rejects.toThrow(GroupMemberNotFoundException);
  });
});