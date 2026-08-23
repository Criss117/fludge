import { describe, expect, it, mock } from "bun:test";
import { AssignGroupsToMemberCommand } from "@fludge/api/modules/iam/organization/application/commands/assign-groups-to-member.command";
import { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { Group } from "@fludge/api/modules/iam/organization/domain/entities/group.entity";
import { Member } from "@fludge/api/modules/iam/organization/domain/entities/member.entity";
import { GroupNotFoundException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-not-found.exception";
import { Permissions } from "@fludge/utils/permissions";
import { UUID } from "@fludge/utils/uuid";
import { err, ok, type Result } from "@fludge/utils/trycatch";
import type { PgOrganizationRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-organization.repository";

type SaveReturnType = ReturnType<PgOrganizationRepository["save"]>;
function makeRepository(saveResult: Result<undefined, Error> = ok(undefined)) { return { save: mock((): SaveReturnType => Promise.resolve(saveResult)) }; }
function makeActiveOrganization() {
  const loggedUserId = UUID.fromString("root-user-1");
  const organization = Organization.create({ name: "Acme", legalName: "Acme", taxId: "TAX", address: "Street", phone: "555", owner: { userId: loggedUserId, role: "owner", assignedBy: null } });
  const member = Member.create({ userId: UUID.fromString("member-1"), role: "member", assignedBy: null }); organization.members.addMember(member);
  const groups = ["Editors", "Auditors"].map((name) => Group.create({ name, description: name, permissions: Permissions.create({ groups: ["read"] }), createdBy: organization.members.owner!.id }));
  groups.forEach((group) => organization.groups.addGroup(group));
  return { activeOrganization: organization, loggedUserId, member, groups };
}

describe("AssignGroupsToMemberCommand", () => {
  it("assigns two groups to one member and saves only groupMembers", async () => {
    const repository = makeRepository(); const command = new AssignGroupsToMemberCommand(repository as any);
    const { activeOrganization, loggedUserId, member, groups } = makeActiveOrganization();
    const result = await command.execute(loggedUserId.toString(), activeOrganization, { memberId: member.id.toString(), groupIds: groups.map((group) => group.id.toString()) });
    expect(result.groupMembers).toHaveLength(2);
    expect(repository.save).toHaveBeenCalledWith(activeOrganization, { onlySave: ["groupMembers"] });
  });
  it("throws NOT_FOUND when one group is unknown", async () => {
    const repository = makeRepository(); const command = new AssignGroupsToMemberCommand(repository as any);
    const { activeOrganization, loggedUserId, member, groups } = makeActiveOrganization();
    await expect(command.execute(loggedUserId.toString(), activeOrganization, { memberId: member.id.toString(), groupIds: [groups[0].id.toString(), "missing"] })).rejects.toBeInstanceOf(GroupNotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });
  it("throws INTERNAL_SERVER_ERROR when saving fails", async () => {
    const repository = makeRepository(err(new Error("boom"))); const command = new AssignGroupsToMemberCommand(repository as any);
    const { activeOrganization, loggedUserId, member, groups } = makeActiveOrganization();
    await expect(command.execute(loggedUserId.toString(), activeOrganization, { memberId: member.id.toString(), groupIds: [groups[0].id.toString()] })).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });
});
