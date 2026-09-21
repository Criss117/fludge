import { describe, expect, it } from "bun:test";

import { UpdateCategoryCommand } from "@fludge/api/modules/catalog/categories/application/commands/update-category.command";
import { CategoryAlreadyExistsException } from "@fludge/api/modules/catalog/categories/domain/exceptions/category-already-exists.exception";
import { CategoryNotFoundException } from "@fludge/api/modules/catalog/categories/domain/exceptions/category-not-found.exception";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { InMemoryCategoryRepository } from "@test/support/repositories/in-memory-category.repository";
import { FakeCategoryUniquenessValidator } from "@test/support/fakes/fake-category-uniqueness-validator";
import { buildOrganization } from "@test/support/builders/organization.builder";
import { Category } from "@fludge/api/modules/catalog/categories/domain/entities/category.entity";
import { UUID } from "@fludge/utils/uuid";

function setup() {
  const repository = new InMemoryCategoryRepository();
  const validator = new FakeCategoryUniquenessValidator();

  const command = new UpdateCategoryCommand(repository, validator as never);

  return { repository, validator, command };
}

function seedCategory(
  repository: InMemoryCategoryRepository,
  orgId: string,
  options?: { name?: string },
) {
  const category = Category.create({
    name: options?.name ?? "Bebidas",
    organizationId: UUID.fromString(orgId),
    createdBy: UUID.fromString("00000000-0000-4000-8000-000000000002"),
    description: "Bebidas y refrescos",
  });

  repository.save(category);

  return category;
}

describe("UpdateCategoryCommand", () => {
  it("updates the name and regenerates the slug", async () => {
    const { command, repository } = setup();
    const { org } = buildOrganization();
    const category = seedCategory(repository, org.id.toString());

    const result = await command.execute(org, {
      id: category.id.toString(),
      name: "Snacks",
    });

    expect(result.name).toBe("Snacks");
    expect(result.slug).toBe("snacks");
  });

  it("updates description and status", async () => {
    const { command, repository } = setup();
    const { org } = buildOrganization();
    const category = seedCategory(repository, org.id.toString());

    const result = await command.execute(org, {
      id: category.id.toString(),
      description: "Nueva descripción",
      status: "inactive",
    });

    expect(result.description).toBe("Nueva descripción");
    expect(result.status).toBe("inactive");
  });

  it("validates uniqueness when the name changes, excluding the current category", async () => {
    const { command, repository, validator } = setup();
    const { org } = buildOrganization();
    const category = seedCategory(repository, org.id.toString());

    await command.execute(org, {
      id: category.id.toString(),
      name: "Nuevo",
    });

    expect(validator.calls).toHaveLength(1);
    expect(validator.calls[0]!.values.name).toBe("Nuevo");
    expect(validator.calls[0]!.excludeId).toBe(category.id.toString());
  });

  it("renames to a slug-preserving variant because the current category is excluded", async () => {
    const { command, repository, validator } = setup();
    const { org } = buildOrganization();
    // slugify normaliza a minúsculas: "Bebidas" -> "bebidas", "BEBIDAS" -> "bebidas"
    const category = seedCategory(repository, org.id.toString(), {
      name: "Bebidas",
    });

    // El command debe excluir la categoría actual; el validator (real) entonces
    // NO encuentra la propia fila por slug y reporta no-tomado.
    const result = await command.execute(org, {
      id: category.id.toString(),
      name: "BEBIDAS",
    });

    expect(validator.calls[0]!.excludeId).toBe(category.id.toString());
    expect(result.name).toBe("BEBIDAS");
    expect(result.slug).toBe("bebidas");
  });

  it("does not validate uniqueness when the name is unchanged", async () => {
    const { command, repository, validator } = setup();
    const { org } = buildOrganization();
    const category = seedCategory(repository, org.id.toString(), { name: "Bebidas" });

    await command.execute(org, {
      id: category.id.toString(),
      description: "Solo descripción",
    });

    expect(validator.calls).toHaveLength(0);
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

  it("throws CategoryAlreadyExistsException when the new name is taken", async () => {
    const { command, repository, validator } = setup();
    const { org } = buildOrganization();
    const category = seedCategory(repository, org.id.toString());

    validator.result = { nameTaken: true, slugTaken: false };

    await expect(
      command.execute(org, { id: category.id.toString(), name: "Tomado" }),
    ).rejects.toThrow(CategoryAlreadyExistsException);
  });

  it("throws InternalServerError when uniqueness validation fails", async () => {
    const { command, repository, validator } = setup();
    const { org } = buildOrganization();
    const category = seedCategory(repository, org.id.toString());

    validator.error = new Error("db down");

    await expect(
      command.execute(org, { id: category.id.toString(), name: "Otro" }),
    ).rejects.toThrow(InternalServerError);
  });
});