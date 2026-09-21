import { describe, expect, it } from "bun:test";

import { DeleteGroupsCommand } from "@fludge/api/modules/iam/organization/application/commands/delete-groups.command";
import { GroupNotFoundException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-not-found.exception";
import { InMemoryGroupRepository } from "@test/support/repositories/in-memory-group.repository";
import { InMemoryGroupMemberRepository } from "@test/support/repositories/in-memory-group-member.repository";
import {
  buildOrganization,
  addGroupToOrganization,
  addMemberToOrganization,
} from "@test/support/builders/organization.builder";
import { GroupMember } from "@fludge/api/modules/iam/organization/domain/entities/group-member.entity";

function setup() {
  const groupRepository = new InMemoryGroupRepository();
  const groupMemberRepository = new InMemoryGroupMemberRepository();
  const command = new DeleteGroupsCommand(groupRepository, groupMemberRepository);

  return { groupRepository, groupMemberRepository, command };
}

describe("DeleteGroupsCommand", () => {
  it("deletes groups and their group members", async () => {
    const { command, groupRepository, groupMemberRepository } = setup();
    const { org } = buildOrganization();
    const member = addMemberToOrganization(org);
    const group = addGroupToOrganization(org, { name: "Ventas" });

    org.addGroupMember(
      GroupMember.create({
        groupId: group.id.toString(),
        memberId: member.id.toString(),
        createdBy: org.members.owner!.id.toString(),
      }),
    );

    const result = await command.execute(org, {
      groupIds: [group.id.toString()],
    });

    expect(result.groups).toHaveLength(0);
    expect(groupRepository.getAll(org.id.toString())).toHaveLength(0);
    expect(groupMemberRepository.getAll(org.id.toString())).toHaveLength(0);
  });

  it("deletes multiple groups", async () => {
    const { command, groupRepository } = setup();
    const { org } = buildOrganization();
    const g1 = addGroupToOrganization(org, { name: "Ventas" });
    const g2 = addGroupToOrganization(org, { name: "Compras" });

    await command.execute(org, {
      groupIds: [g1.id.toString(), g2.id.toString()],
    });

    expect(groupRepository.getAll(org.id.toString())).toHaveLength(0);
  });

  it("throws GroupNotFoundException when a group does not exist", async () => {
    const { command } = setup();
    const { org } = buildOrganization();
    addGroupToOrganization(org, { name: "Ventas" });

    await expect(
      command.execute(org, {
        groupIds: ["00000000-0000-4000-8000-000000000000"],
      }),
    ).rejects.toThrow(GroupNotFoundException);
  });
});