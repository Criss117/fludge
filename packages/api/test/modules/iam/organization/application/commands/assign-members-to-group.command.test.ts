import { describe, expect, it, mock } from "bun:test";
import { AssignMembersToGroupCommand } from "@fludge/api/modules/iam/organization/application/commands/assign-members-to-group.command";
import { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { Member } from "@fludge/api/modules/iam/organization/domain/entities/member.entity";
import { Group } from "@fludge/api/modules/iam/organization/domain/entities/group.entity";
import { MemberNotFoundException } from "@fludge/api/modules/iam/organization/domain/exceptions/member-not-found.exeption";
import { GroupNotFoundException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-not-found.exception";
import { GroupMemberAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-member-elready-exists.exception";
import { Permissions } from "@fludge/utils/permissions/index";
import { UUID } from "@fludge/utils/uuid";
import { err, ok, type Result } from "@fludge/utils/trycatch";
import type { PgGroupMemberRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-group-member.repository";
import { MemberIsOwnerException } from "@fludge/api/modules/iam/organization/domain/exceptions/member-is-owner.exception";

type SaveReturnType = ReturnType<PgGroupMemberRepository["save"]>;
function makeRepository(saveResult: Result<undefined, Error> = ok(undefined)) {
  return {
    save: mock((): SaveReturnType => Promise.resolve(saveResult)),
  };
}
function makeActiveOrganization() {
  const loggedUserId = UUID.fromString("root-user-1");
  const organization = Organization.create({
    name: "Acme",
    legalName: "Acme",
    taxId: "TAX",
    address: "Street",
    phone: "555",
    owner: { userId: loggedUserId, role: "owner", assignedBy: null },
  });
  const group = Group.create({
    name: "Editors",
    description: "Editors",
    permissions: Permissions.create(["groups:read"]),
    createdBy: organization.members.owner!.id,
  });
  organization.groups.addGroup(group);
  return { activeOrganization: organization, loggedUserId, group };
}
function addMember(organization: Organization, userId: string) {
  const member = Member.create({
    userId: UUID.fromString(userId),
    role: "member",
    assignedBy: null,
  });
  organization.members.addMember(member);
  return member;
}

describe("AssignMembersToGroupCommand", () => {
  it("assigns multiple members and saves only groupMembers", async () => {
    const repository = makeRepository();
    const command = new AssignMembersToGroupCommand(repository as any);
    const { activeOrganization, loggedUserId, group } =
      makeActiveOrganization();
    const memberOne = addMember(activeOrganization, "member-1");
    const memberTwo = addMember(activeOrganization, "member-2");

    const result = await command.execute(
      loggedUserId.toString(),
      activeOrganization,
      {
        groupId: group.id.toString(),
        memberIds: [memberOne.id.toString(), memberTwo.id.toString()],
      },
    );
    expect(result.groupMembers).toHaveLength(2);
    expect(repository.save).toHaveBeenCalledWith(
      activeOrganization.id.toString(),
      expect.arrayContaining(activeOrganization.groupMembers),
    );
  });
  it("throws NOT_FOUND for an unknown group", async () => {
    const repository = makeRepository();
    const command = new AssignMembersToGroupCommand(repository as any);
    const { activeOrganization, loggedUserId } = makeActiveOrganization();
    await expect(
      command.execute(loggedUserId.toString(), activeOrganization, {
        groupId: "missing",
        memberIds: ["member-1"],
      }),
    ).rejects.toBeInstanceOf(GroupNotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });
  it("throws NOT_FOUND for an unknown member", async () => {
    const repository = makeRepository();
    const command = new AssignMembersToGroupCommand(repository as any);
    const { activeOrganization, loggedUserId, group } =
      makeActiveOrganization();
    await expect(
      command.execute(loggedUserId.toString(), activeOrganization, {
        groupId: group.id.toString(),
        memberIds: ["missing"],
      }),
    ).rejects.toBeInstanceOf(MemberNotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });
  it("throws CONFLICT for a duplicate group-member pair", async () => {
    const repository = makeRepository();
    const command = new AssignMembersToGroupCommand(repository as any);
    const { activeOrganization, loggedUserId, group } =
      makeActiveOrganization();
    const member = addMember(activeOrganization, "member-3");
    await command.execute(loggedUserId.toString(), activeOrganization, {
      groupId: group.id.toString(),
      memberIds: [member.id.toString()],
    });
    await expect(
      command.execute(loggedUserId.toString(), activeOrganization, {
        groupId: group.id.toString(),
        memberIds: [member.id.toString()],
      }),
    ).rejects.toBeInstanceOf(GroupMemberAlreadyExistsException);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
  it("throws INTERNAL_SERVER_ERROR when saving fails", async () => {
    const repository = makeRepository(err(new Error("boom")));
    const command = new AssignMembersToGroupCommand(repository as any);
    const { activeOrganization, loggedUserId, group } =
      makeActiveOrganization();
    const member = addMember(activeOrganization, "member-4");
    await expect(
      command.execute(loggedUserId.toString(), activeOrganization, {
        groupId: group.id.toString(),
        memberIds: [member.id.toString()],
      }),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });

  it("throws BAD_REQUEST when member is owner", async () => {
    const repository = makeRepository(err(new Error("boom")));
    const command = new AssignMembersToGroupCommand(repository as any);
    const { activeOrganization, loggedUserId, group } =
      makeActiveOrganization();

    const owner = activeOrganization.members.owner!;

    await expect(
      command.execute(loggedUserId.toString(), activeOrganization, {
        groupId: group.id.toString(),
        memberIds: [owner.id.toString()],
      }),
    ).rejects.toThrow(MemberIsOwnerException);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
