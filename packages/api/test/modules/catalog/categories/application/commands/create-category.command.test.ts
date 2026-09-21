import { describe, expect, it } from "bun:test";

import { CreateCategoryCommand } from "@fludge/api/modules/catalog/categories/application/commands/create-category.command";
import { CategoryAlreadyExistsException } from "@fludge/api/modules/catalog/categories/domain/exceptions/category-already-exists.exception";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { InMemoryCategoryRepository } from "@test/support/repositories/in-memory-category.repository";
import { FakeCategoryUniquenessValidator } from "@test/support/fakes/fake-category-uniqueness-validator";
import { buildOrganization } from "@test/support/builders/organization.builder";

type Cmd = {
  name: string;
  description: string;
};

function setup() {
  const repository = new InMemoryCategoryRepository();
  const validator = new FakeCategoryUniquenessValidator();

  const command = new CreateCategoryCommand(
    repository,
    validator as never,
  );

  return { repository, validator, command };
}

function validCmd(overrides?: Partial<Cmd>): Cmd {
  return {
    name: "Bebidas",
    description: "Bebidas y refrescos",
    ...overrides,
  };
}

describe("CreateCategoryCommand", () => {
  it("creates a category and persists it", async () => {
    const { command, repository } = setup();
    const { org, ownerUserId } = buildOrganization();

    const result = await command.execute(ownerUserId, org, validCmd());

    expect(result.name).toBe("Bebidas");
    expect(result.slug).toBe("bebidas");
    expect(result.status).toBe("active");
    expect(repository.getAll(org.id.toString())).toHaveLength(1);
  });

  it("assigns the logged member as createdBy", async () => {
    const { command } = setup();
    const { org, ownerUserId } = buildOrganization();

    const result = await command.execute(ownerUserId, org, validCmd());

    const loggedMember = org.members.getMemberByUserId(
      (await import("@fludge/utils/uuid")).UUID.fromString(ownerUserId),
    )!;
    expect(result.createdBy).toBe(loggedMember.id.toString());
  });

  it("validates uniqueness with the organization id", async () => {
    const { command, validator } = setup();
    const { org, ownerUserId } = buildOrganization();

    await command.execute(ownerUserId, org, validCmd());

    expect(validator.calls).toHaveLength(1);
    expect(validator.calls[0]!.organizationId).toBe(org.id.toString());
    expect(validator.calls[0]!.values.name).toBe("Bebidas");
  });

  it("throws CategoryAlreadyExistsException when the name is taken", async () => {
    const { command, validator } = setup();
    const { org, ownerUserId } = buildOrganization();

    validator.result = { nameTaken: true, slugTaken: false };

    await expect(command.execute(ownerUserId, org, validCmd())).rejects.toThrow(
      CategoryAlreadyExistsException,
    );
  });

  it("throws CategoryAlreadyExistsException when the slug is taken", async () => {
    const { command, validator } = setup();
    const { org, ownerUserId } = buildOrganization();

    validator.result = { nameTaken: false, slugTaken: true };

    await expect(command.execute(ownerUserId, org, validCmd())).rejects.toThrow(
      CategoryAlreadyExistsException,
    );
  });

  it("throws InternalServerError when uniqueness validation fails", async () => {
    const { command, validator } = setup();
    const { org, ownerUserId } = buildOrganization();

    validator.error = new Error("db down");

    await expect(command.execute(ownerUserId, org, validCmd())).rejects.toThrow(
      InternalServerError,
    );
  });

  it("does not persist when the name is taken", async () => {
    const { command, validator, repository } = setup();
    const { org, ownerUserId } = buildOrganization();

    validator.result = { nameTaken: true, slugTaken: false };

    await expect(command.execute(ownerUserId, org, validCmd())).rejects.toThrow(
      CategoryAlreadyExistsException,
    );

    expect(repository.getAll(org.id.toString())).toHaveLength(0);
  });
});