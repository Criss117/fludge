import { describe, expect, it } from "bun:test";

import { AssignMembersToGroupCommand } from "@fludge/api/modules/iam/organization/application/commands/assign-members-to-group.command";
import { GroupNotFoundException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-not-found.exception";
import { MemberNotFoundException } from "@fludge/api/modules/iam/organization/domain/exceptions/member-not-found.exeption";
import { GroupMemberAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-member-elready-exists.exception";
import { InMemoryGroupMemberRepository } from "@test/support/repositories/in-memory-group-member.repository";
import {
  buildOrganization,
  addGroupToOrganization,
  addMemberToOrganization,
} from "@test/support/builders/organization.builder";
import { UUID } from "@fludge/utils/uuid";

function setup() {
  const repository = new InMemoryGroupMemberRepository();
  const command = new AssignMembersToGroupCommand(repository);

  return { repository, command };
}

describe("AssignMembersToGroupCommand", () => {
  it("assigns members to a group and persists the relations", async () => {
    const { command, repository } = setup();
    const { org, ownerUserId } = buildOrganization();
    const group = addGroupToOrganization(org, { name: "Ventas" });
    const m1 = addMemberToOrganization(org);
    const m2 = addMemberToOrganization(org);

    const result = await command.execute(ownerUserId, org, {
      groupId: group.id.toString(),
      memberIds: [m1.id.toString(), m2.id.toString()],
    });

    expect(result.groupMembers).toHaveLength(2);
    expect(repository.getAll(org.id.toString())).toHaveLength(2);
  });

  it("throws GroupNotFoundException when the group does not exist", async () => {
    const { command } = setup();
    const { org, ownerUserId } = buildOrganization();
    const member = addMemberToOrganization(org);

    await expect(
      command.execute(ownerUserId, org, {
        groupId: UUID.generate().toString(),
        memberIds: [member.id.toString()],
      }),
    ).rejects.toThrow(GroupNotFoundException);
  });

  it("throws MemberNotFoundException when a member does not exist", async () => {
    const { command } = setup();
    const { org, ownerUserId } = buildOrganization();
    const group = addGroupToOrganization(org, { name: "Ventas" });

    await expect(
      command.execute(ownerUserId, org, {
        groupId: group.id.toString(),
        memberIds: [UUID.generate().toString()],
      }),
    ).rejects.toThrow(MemberNotFoundException);
  });

  it("throws GroupMemberAlreadyExistsException when already assigned", async () => {
    const { command } = setup();
    const { org, ownerUserId } = buildOrganization();
    const group = addGroupToOrganization(org, { name: "Ventas" });
    const member = addMemberToOrganization(org);
    const memberId = member.id.toString();

    await command.execute(ownerUserId, org, {
      groupId: group.id.toString(),
      memberIds: [memberId],
    });

    await expect(
      command.execute(ownerUserId, org, {
        groupId: group.id.toString(),
        memberIds: [memberId],
      }),
    ).rejects.toThrow(GroupMemberAlreadyExistsException);
  });
});