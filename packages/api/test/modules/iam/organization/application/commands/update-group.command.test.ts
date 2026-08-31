import { describe, expect, it, mock } from "bun:test";
import { UpdateGroupCommand } from "@fludge/api/modules/iam/organization/application/commands/update-group.command";
import { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { Group } from "@fludge/api/modules/iam/organization/domain/entities/group.entity";
import { GroupNotFoundException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-not-found.exception";
import { GroupAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-already-exists.exception";
import { Permissions } from "@fludge/utils/permissions/index";
import { err, ok, type Result } from "@fludge/utils/trycatch";
import type { GroupRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-group.repository";

type SaveReturnType = ReturnType<GroupRepository["save"]>;
function makeRepository(saveResult: Result<undefined, Error> = ok(undefined)) {
  return {
    save: mock((): SaveReturnType => Promise.resolve(saveResult)),
  };
}
function makeActiveOrganization() {
  const organization = Organization.create({
    name: "Acme",
    legalName: "Acme",
    taxId: "TAX",
    address: "Street",
    phone: "555",
    owner: { userId: "root-user-1" as any, role: "owner", assignedBy: null },
  });
  const group = Group.create({
    name: "Editors",
    description: "Old",
    permissions: Permissions.create(["groups:read"]),
    createdBy: null,
  });
  organization.groups.addGroup(group);
  return { activeOrganization: organization, group };
}

describe("UpdateGroupCommand", () => {
  it("updates fields and saves only groups", async () => {
    const repository = makeRepository();
    const command = new UpdateGroupCommand(repository as any);
    const { activeOrganization, group } = makeActiveOrganization();
    const result = await command.execute(activeOrganization, {
      id: group.id.toString(),
      name: "Managers",
      description: "New",
      permissions: ["groups:update"],
    });
    expect(result.groups[0]).toMatchObject({
      name: "Managers",
      slug: "managers",
      description: "New",
      permissions: ["groups:update", "groups:read"],
    });
    expect(repository.save).toHaveBeenCalledWith(
      activeOrganization.id.toString(),
      group,
    );
  });
  it("flips active state with the load-bearing toogleActive option", async () => {
    const repository = makeRepository();
    const command = new UpdateGroupCommand(repository as any);
    const { activeOrganization, group } = makeActiveOrganization();
    await command.execute(activeOrganization, {
      id: group.id.toString(),
      status: "inactive",
    });
    expect(
      activeOrganization.groups.getGroup(group.id)!.status.isActive(),
    ).toBe(false);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
  it("throws NOT_FOUND for an unknown group", async () => {
    const repository = makeRepository();
    const command = new UpdateGroupCommand(repository as any);
    const { activeOrganization } = makeActiveOrganization();
    await expect(
      command.execute(activeOrganization, { id: "missing" }),
    ).rejects.toBeInstanceOf(GroupNotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });
  it("throws CONFLICT when the new name belongs to another group", async () => {
    const repository = makeRepository();
    const command = new UpdateGroupCommand(repository as any);
    const { activeOrganization, group } = makeActiveOrganization();
    activeOrganization.groups.addGroup(
      Group.create({
        name: "Managers",
        description: null,
        permissions: Permissions.create([]),
        createdBy: null,
      }),
    );
    await expect(
      command.execute(activeOrganization, {
        id: group.id.toString(),
        name: "Managers",
      }),
    ).rejects.toBeInstanceOf(GroupAlreadyExistsException);
    expect(repository.save).not.toHaveBeenCalled();
  });
  it("throws INTERNAL_SERVER_ERROR when saving fails", async () => {
    const repository = makeRepository(err(new Error("boom")));
    const command = new UpdateGroupCommand(repository as any);
    const { activeOrganization, group } = makeActiveOrganization();
    await expect(
      command.execute(activeOrganization, {
        id: group.id.toString(),
        description: "Changed",
      }),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });
});
