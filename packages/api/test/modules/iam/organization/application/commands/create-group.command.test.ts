import { describe, expect, it } from "bun:test";

import { CreateGroupCommand } from "@fludge/api/modules/iam/organization/application/commands/create-group.command";
import { GroupAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-already-exists.exception";
import { InMemoryGroupRepository } from "@test/support/repositories/in-memory-group.repository";
import { buildOrganization } from "@test/support/builders/organization.builder";
import { UUID } from "@fludge/utils/uuid";
import type { Permission } from "@fludge/utils/permissions/data";

type Cmd = {
  name: string;
  description: string;
  permissions: Permission[];
};

function setup() {
  const repository = new InMemoryGroupRepository();
  const command = new CreateGroupCommand(repository);

  return { repository, command };
}

function validCmd(overrides?: Partial<Cmd>): Cmd {
  return {
    name: "Ventas",
    description: "Equipo de ventas",
    permissions: ["products:create"],
    ...overrides,
  };
}

describe("CreateGroupCommand", () => {
  it("creates a group and persists it", async () => {
    const { command, repository } = setup();
    const { org, ownerUserId } = buildOrganization();

    const result = await command.execute(ownerUserId, org, validCmd());

    expect(result.groups).toHaveLength(1);
    expect(repository.getAll(org.id.toString())).toHaveLength(1);
  });

  it("assigns the logged member as createdBy", async () => {
    const { command } = setup();
    const { org, ownerUserId } = buildOrganization();

    const result = await command.execute(ownerUserId, org, validCmd());

    const group = result.groups[0]!;
    const loggedMember = org.members.getMemberByUserId(UUID.fromString(ownerUserId))!;
    expect(group.createdBy).toBe(loggedMember.id.toString());
  });

  it("normalizes the permissions", async () => {
    const { command } = setup();
    const { org, ownerUserId } = buildOrganization();

    const result = await command.execute(ownerUserId, org, validCmd());

    const group = result.groups[0]!;
    // products tiene acción read, se auto-agrega
    expect(group.permissions).toContain("products:create");
    expect(group.permissions).toContain("products:read");
  });

  it("throws GroupAlreadyExistsException when the name is already used", async () => {
    const { command } = setup();
    const { org, ownerUserId } = buildOrganization();

    await command.execute(ownerUserId, org, validCmd());

    await expect(
      command.execute(ownerUserId, org, validCmd({ name: "Ventas" })),
    ).rejects.toThrow(GroupAlreadyExistsException);
  });

  it("throws GroupAlreadyExistsException when the slug collides", async () => {
    const { command } = setup();
    const { org, ownerUserId } = buildOrganization();

    await command.execute(ownerUserId, org, validCmd());

    // mismo slug "ventas" aunque el nombre difiera en el case
    await expect(
      command.execute(ownerUserId, org, validCmd({ name: "VENTAS" })),
    ).rejects.toThrow(GroupAlreadyExistsException);
  });
});