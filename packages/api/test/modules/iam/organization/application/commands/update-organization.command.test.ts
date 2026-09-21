import { describe, expect, it } from "bun:test";

import { UpdateOrganizationCommand } from "@fludge/api/modules/iam/organization/application/commands/update-organization.command";
import { OrganizationAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/organization-already-exists.exception";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { InMemoryOrganizationRepository } from "@test/support/repositories/in-memory-organization.repository";
import { FakeOrganizationUniquenessValidator } from "@test/support/fakes/fake-organization-uniqueness-validator";
import { buildOrganization } from "@test/support/builders/organization.builder";

function setup() {
  const repository = new InMemoryOrganizationRepository();
  const validator = new FakeOrganizationUniquenessValidator();

  const command = new UpdateOrganizationCommand(
    validator as never,
    repository,
  );

  return { repository, validator, command };
}

describe("UpdateOrganizationCommand", () => {
  it("updates the organization name and slug", async () => {
    const { command, repository } = setup();
    const { org } = buildOrganization();

    const result = await command.execute(org, { name: "Fludge Internacional" });

    expect(result.name).toBe("Fludge Internacional");
    expect(result.slug).toBe("fludge-internacional");
    expect(repository.getAll()).toHaveLength(1);
  });

  it("updates contact fields", async () => {
    const { command } = setup();
    const { org } = buildOrganization();

    const result = await command.execute(org, {
      phone: "+57 311 000 0000",
      address: "Av. Principal 999",
    });

    expect(result.phone).toBe("+57 311 000 0000");
    expect(result.address).toBe("Av. Principal 999");
  });

  it("validates uniqueness excluding the current organization", async () => {
    const { command, validator } = setup();
    const { org } = buildOrganization();

    await command.execute(org, { name: "Nuevo Nombre" });

    expect(validator.calls).toHaveLength(1);
    expect(validator.calls[0]!.excludeId).toBe(org.id.toString());
  });

  it("throws OrganizationAlreadyExistsException when the new name is taken", async () => {
    const { command, validator } = setup();
    const { org } = buildOrganization();

    validator.result = {
      legalNameTaken: false,
      nameTaken: true,
      phoneTaken: false,
      taxIdTaken: false,
      slugTaken: true,
    };

    await expect(command.execute(org, { name: "Tomado" })).rejects.toThrow(
      OrganizationAlreadyExistsException,
    );
  });

  it("throws OrganizationAlreadyExistsException when the legalName is taken", async () => {
    const { command, validator } = setup();
    const { org } = buildOrganization();

    validator.result = {
      legalNameTaken: true,
      nameTaken: false,
      phoneTaken: false,
      taxIdTaken: false,
      slugTaken: false,
    };

    await expect(command.execute(org, { name: "Otro" })).rejects.toThrow(
      OrganizationAlreadyExistsException,
    );
  });

  it("throws InternalServerError when uniqueness validation fails", async () => {
    const { command, validator } = setup();
    const { org } = buildOrganization();

    validator.error = new Error("db down");

    await expect(command.execute(org, { name: "Otro" })).rejects.toThrow(
      InternalServerError,
    );
  });

  it("does not persist when validation fails", async () => {
    const { command, validator, repository } = setup();
    const { org } = buildOrganization();

    validator.error = new Error("db down");

    await expect(command.execute(org, { name: "Otro" })).rejects.toThrow(
      InternalServerError,
    );

    expect(repository.getAll()).toHaveLength(0);
  });
});