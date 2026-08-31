import { describe, expect, it, mock } from "bun:test";
import { CreateGroupCommand } from "@fludge/api/modules/iam/organization/application/commands/create-group.command";
import { err, ok, type Result } from "@fludge/utils/trycatch";
import type { GroupRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-group.repository";
import { UUID } from "@fludge/utils/uuid";
import { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";

import { Group } from "@fludge/api/modules/iam/organization/domain/entities/group.entity";
import { GroupAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-already-exists.exception";
import type { PermissionEnum } from "@fludge/utils/permissions/data";
import { Permissions } from "@fludge/utils/permissions/index";

type SaveReturnType = ReturnType<GroupRepository["save"]>;

function makeRepository(saveResult: Result<undefined, Error> = ok(undefined)) {
  return {
    save: mock((): SaveReturnType => Promise.resolve(saveResult)),
  };
}

function makeActiveOrganization() {
  const loggedUserId = UUID.fromString("root-user-1");

  const activeOrganization = Organization.create({
    name: "Acme Corporation",
    legalName: "Acme Corporation",
    taxId: "TAX-1",
    address: "Main Street",
    phone: "555-0100",
    owner: {
      userId: loggedUserId,
      role: "owner",
      assignedBy: null,
    },
  });

  return { activeOrganization, loggedUserId };
}

const validCMD = {
  name: "Editors",
  description: "A group",
  permissions: ["groups:read"] satisfies PermissionEnum[],
};

describe("CreateGroupCommand", () => {
  it("creates a new group when the command is valid", async () => {
    const repository = makeRepository();
    const command = new CreateGroupCommand(repository as any);
    const { activeOrganization, loggedUserId } = makeActiveOrganization();

    const result = await command.execute(
      loggedUserId.toString(),
      activeOrganization,
      validCMD,
    );

    const createdGroup = result.groups[0];

    const owner = activeOrganization.members.owner!;

    expect(result.groups.length).toBe(1);
    expect(createdGroup).toMatchObject({
      ...validCMD,
      createdBy: owner.id.toString(),
    });
    expect(repository.save).toHaveBeenCalledWith(
      activeOrganization.id.toString(),
      expect.any(Group),
    );
  });

  it("creates a new group when the command is valid and organiation has groups", async () => {
    const repository = makeRepository();
    const command = new CreateGroupCommand(repository as any);
    const { activeOrganization, loggedUserId } = makeActiveOrganization();

    const owner = activeOrganization.members.owner!;

    activeOrganization.groups.addGroup(
      Group.create({
        name: "Otro grupo",
        description: validCMD.description,
        permissions: Permissions.create(["groups:read"]),
        createdBy: owner.id,
      }),
    );

    const result = await command.execute(
      loggedUserId.toString(),
      activeOrganization,
      validCMD,
    );

    const createdGroup = result.groups[1];

    expect(result.groups.length).toBe(2);
    expect(createdGroup).toMatchObject({
      ...validCMD,
      createdBy: owner.id.toString(),
    });
    expect(repository.save).toHaveBeenCalledWith(
      activeOrganization.id.toString(),
      expect.any(Group),
    );
  });

  it("throws CONFLICT if the name is already taken", async () => {
    const repository = makeRepository();
    const command = new CreateGroupCommand(repository as any);
    const { activeOrganization, loggedUserId } = makeActiveOrganization();

    const owner = activeOrganization.members.owner!;

    activeOrganization.groups.addGroup(
      Group.create({
        name: validCMD.name,
        description: validCMD.description,
        permissions: Permissions.create(["groups:read"]),
        createdBy: owner.id,
      }),
    );

    await expect(
      command.execute(loggedUserId.toString(), activeOrganization, validCMD),
    ).rejects.toThrow(GroupAlreadyExistsException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("throws INTERNAL_SERVER_ERROR if the save fails", async () => {
    const repository = makeRepository(err(new Error("boom")));
    const command = new CreateGroupCommand(repository as any);
    const { activeOrganization, loggedUserId } = makeActiveOrganization();

    await expect(
      command.execute(loggedUserId.toString(), activeOrganization, validCMD),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(repository.save).toHaveBeenCalledWith(
      activeOrganization.id.toString(),
      expect.any(Group),
    );
  });
});
