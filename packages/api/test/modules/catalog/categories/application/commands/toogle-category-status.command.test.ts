import { describe, expect, it } from "bun:test";

import { ToggleCategoryStatusCommand } from "@fludge/api/modules/catalog/categories/application/commands/toogle-category-status.command";
import { CategoryNotFoundException } from "@fludge/api/modules/catalog/categories/domain/exceptions/category-not-found.exception";
import { InMemoryCategoryRepository } from "@test/support/repositories/in-memory-category.repository";
import { buildOrganization } from "@test/support/builders/organization.builder";
import { Category } from "@fludge/api/modules/catalog/categories/domain/entities/category.entity";
import { UUID } from "@fludge/utils/uuid";

function setup() {
  const repository = new InMemoryCategoryRepository();
  const command = new ToggleCategoryStatusCommand(repository);

  return { repository, command };
}

function seedCategory(
  repository: InMemoryCategoryRepository,
  orgId: string,
  options?: { status?: "active" | "inactive" },
) {
  const category = Category.create({
    name: "Bebidas",
    organizationId: UUID.fromString(orgId),
    createdBy: UUID.fromString("00000000-0000-4000-8000-000000000002"),
    description: "Bebidas y refrescos",
  });

  if (options?.status === "inactive") category.archive();

  repository.save(category);

  return category;
}

describe("ToggleCategoryStatusCommand", () => {
  it("toggles an active category to inactive", async () => {
    const { command, repository } = setup();
    const { org } = buildOrganization();
    const category = seedCategory(repository, org.id.toString());

    const result = await command.execute(org, {
      id: category.id.toString(),
    });

    expect(result.status).toBe("inactive");
  });

  it("toggles an inactive category to active", async () => {
    const { command, repository } = setup();
    const { org } = buildOrganization();
    const category = seedCategory(repository, org.id.toString(), {
      status: "inactive",
    });

    const result = await command.execute(org, {
      id: category.id.toString(),
    });

    expect(result.status).toBe("active");
  });

  it("persists the toggled category", async () => {
    const { command, repository } = setup();
    const { org } = buildOrganization();
    const category = seedCategory(repository, org.id.toString());

    await command.execute(org, { id: category.id.toString() });

    const persisted = repository.getAll(org.id.toString())[0]!;
    expect(persisted.values.status).toBe("inactive");
  });

  it("throws CategoryNotFoundException when the category does not exist", async () => {
    const { command } = setup();
    const { org } = buildOrganization();

    await expect(
      command.execute(org, {
        id: "00000000-0000-4000-8000-000000000000",
      }),
    ).rejects.toThrow(CategoryNotFoundException);
  });
});