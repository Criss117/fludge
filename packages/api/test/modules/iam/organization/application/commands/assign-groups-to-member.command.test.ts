import { describe, expect, it } from "bun:test";

import { AssignGroupsToMemberCommand } from "@fludge/api/modules/iam/organization/application/commands/assign-groups-to-member.command";
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
  const command = new AssignGroupsToMemberCommand(repository);

  return { repository, command };
}

describe("AssignGroupsToMemberCommand", () => {
  it("assigns groups to a member and persists the relations", async () => {
    const { command, repository } = setup();
    const { org, ownerUserId } = buildOrganization();
    const g1 = addGroupToOrganization(org, { name: "Ventas" });
    const g2 = addGroupToOrganization(org, { name: "Compras" });
    const member = addMemberToOrganization(org);

    const result = await command.execute(ownerUserId, org, {
      memberId: member.id.toString(),
      groupIds: [g1.id.toString(), g2.id.toString()],
    });

    expect(result.groupMembers).toHaveLength(2);
    expect(repository.getAll(org.id.toString())).toHaveLength(2);
  });

  it("throws GroupNotFoundException when a group does not exist", async () => {
    const { command } = setup();
    const { org, ownerUserId } = buildOrganization();
    const member = addMemberToOrganization(org);

    await expect(
      command.execute(ownerUserId, org, {
        memberId: member.id.toString(),
        groupIds: [UUID.generate().toString()],
      }),
    ).rejects.toThrow(GroupNotFoundException);
  });

  it("throws MemberNotFoundException when the member does not exist", async () => {
    const { command } = setup();
    const { org, ownerUserId } = buildOrganization();
    const group = addGroupToOrganization(org, { name: "Ventas" });

    await expect(
      command.execute(ownerUserId, org, {
        memberId: UUID.generate().toString(),
        groupIds: [group.id.toString()],
      }),
    ).rejects.toThrow(MemberNotFoundException);
  });

  it("throws GroupMemberAlreadyExistsException when already assigned", async () => {
    const { command } = setup();
    const { org, ownerUserId } = buildOrganization();
    const group = addGroupToOrganization(org, { name: "Ventas" });
    const member = addMemberToOrganization(org);

    await command.execute(ownerUserId, org, {
      memberId: member.id.toString(),
      groupIds: [group.id.toString()],
    });

    await expect(
      command.execute(ownerUserId, org, {
        memberId: member.id.toString(),
        groupIds: [group.id.toString()],
      }),
    ).rejects.toThrow(GroupMemberAlreadyExistsException);
  });
});