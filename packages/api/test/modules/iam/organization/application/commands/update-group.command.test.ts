import { describe, expect, it } from "bun:test";

import { UpdateGroupCommand } from "@fludge/api/modules/iam/organization/application/commands/update-group.command";
import { GroupNotFoundException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-not-found.exception";
import { GroupAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/group-already-exists.exception";
import { InMemoryGroupRepository } from "@test/support/repositories/in-memory-group.repository";
import { buildOrganization, addGroupToOrganization } from "@test/support/builders/organization.builder";

function setup() {
  const repository = new InMemoryGroupRepository();
  const command = new UpdateGroupCommand(repository);

  return { repository, command };
}

describe("UpdateGroupCommand", () => {
  it("updates an existing group and persists it", async () => {
    const { command, repository } = setup();
    const { org } = buildOrganization();
    const group = addGroupToOrganization(org, { name: "Ventas" });

    const result = await command.execute(org, {
      id: group.id.toString(),
      name: "Compras",
      description: "Equipo de compras",
    });

    const updated = result.groups.find((g) => g.id === group.id.toString())!;
    expect(updated.name).toBe("Compras");
    expect(updated.slug).toBe("compras");
    expect(updated.description).toBe("Equipo de compras");

    const persisted = repository.getAll(org.id.toString())[0]!;
    expect(persisted.values.name).toBe("Compras");
  });

  it("updates permissions and status", async () => {
    const { command } = setup();
    const { org } = buildOrganization();
    const group = addGroupToOrganization(org);

    const result = await command.execute(org, {
      id: group.id.toString(),
      permissions: ["customers:create"],
      status: "inactive",
    });

    const updated = result.groups.find((g) => g.id === group.id.toString())!;
    expect(updated.permissions).toContain("customers:create");
    expect(updated.status).toBe("inactive");
  });

  it("throws GroupNotFoundException when the group does not exist", async () => {
    const { command } = setup();
    const { org } = buildOrganization();

    await expect(
      command.execute(org, { id: "00000000-0000-4000-8000-000000000000" }),
    ).rejects.toThrow(GroupNotFoundException);
  });

  it("throws GroupAlreadyExistsException when renaming to a taken name", async () => {
    const { command } = setup();
    const { org } = buildOrganization();
    addGroupToOrganization(org, { name: "Ventas" });
    const other = addGroupToOrganization(org, { name: "Compras" });

    await expect(
      command.execute(org, { id: other.id.toString(), name: "Ventas" }),
    ).rejects.toThrow(GroupAlreadyExistsException);
  });
});