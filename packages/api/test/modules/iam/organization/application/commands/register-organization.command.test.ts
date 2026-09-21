import { describe, expect, it } from "bun:test";

import { RegisterOrganizationCommand } from "@fludge/api/modules/iam/organization/application/commands/register-organization.commad";
import { OrganizationAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/organization-already-exists.exception";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { InMemoryOrganizationRepository } from "@test/support/repositories/in-memory-organization.repository";
import { FakeOrganizationUniquenessValidator } from "@test/support/fakes/fake-organization-uniqueness-validator";
import { UUID } from "@fludge/utils/uuid";

type Cmd = {
  name: string;
  phone: string;
  legalName: string;
  taxId: string;
  address: string;
};

function setup() {
  const repository = new InMemoryOrganizationRepository();
  const validator = new FakeOrganizationUniquenessValidator();

  const command = new RegisterOrganizationCommand(
    // El command espera la clase concreta; el fake es un test double estructural.
    validator as never,
    repository,
  );

  return { repository, validator, command };
}

function validCmd(overrides?: Partial<Cmd>): Cmd {
  return {
    name: "Fludge Corp",
    phone: "+57 300 123 4567",
    legalName: "Fludge Corp S.A.",
    taxId: "900-123-456",
    address: "Calle 123",
    ...overrides,
  };
}

describe("RegisterOrganizationCommand", () => {
  it("registers an organization and persists it", async () => {
    const { command, repository, validator } = setup();
    const rootUserId = UUID.generate().toString();

    const result = await command.execute(rootUserId, validCmd());

    expect(result.name).toBe("Fludge Corp");
    expect(result.slug).toBe("fludge-corp");
    expect(result.status).toBe("active");
    expect(result.members).toHaveLength(1);
    expect(result.groups).toHaveLength(1);
    expect(repository.getAll()).toHaveLength(1);
    expect(validator.calls).toHaveLength(1);
  });

  it("creates the Administradores group with full permissions", async () => {
    const { command } = setup();
    const rootUserId = UUID.generate().toString();

    const result = await command.execute(rootUserId, validCmd());

    const adminGroup = result.groups[0]!;
    expect(adminGroup.name).toBe("Administradores");
    expect(adminGroup.permissions).toContain("organizations:update");
  });

  it("throws OrganizationAlreadyExistsException when the name is taken", async () => {
    const { command, validator } = setup();

    validator.result = {
      legalNameTaken: false,
      nameTaken: true,
      phoneTaken: false,
      taxIdTaken: false,
      slugTaken: false,
    };

    expect(
      command.execute(UUID.generate().toString(), validCmd()),
    ).rejects.toThrow(OrganizationAlreadyExistsException);
  });

  it("throws OrganizationAlreadyExistsException when the legalName is taken", async () => {
    const { command, validator } = setup();

    validator.result = {
      legalNameTaken: true,
      nameTaken: false,
      phoneTaken: false,
      taxIdTaken: false,
      slugTaken: false,
    };

    expect(
      command.execute(UUID.generate().toString(), validCmd()),
    ).rejects.toThrow(OrganizationAlreadyExistsException);
  });

  it("throws OrganizationAlreadyExistsException when the taxId is taken", async () => {
    const { command, validator } = setup();

    validator.result = {
      legalNameTaken: false,
      nameTaken: false,
      phoneTaken: false,
      taxIdTaken: true,
      slugTaken: false,
    };

    expect(
      command.execute(UUID.generate().toString(), validCmd()),
    ).rejects.toThrow(OrganizationAlreadyExistsException);
  });

  it("throws OrganizationAlreadyExistsException when the phone is taken", async () => {
    const { command, validator } = setup();

    validator.result = {
      legalNameTaken: false,
      nameTaken: false,
      phoneTaken: true,
      taxIdTaken: false,
      slugTaken: false,
    };

    expect(
      command.execute(UUID.generate().toString(), validCmd()),
    ).rejects.toThrow(OrganizationAlreadyExistsException);
  });

  it("throws InternalServerError when uniqueness validation fails", async () => {
    const { command, validator } = setup();

    validator.error = new Error("db down");

    expect(
      command.execute(UUID.generate().toString(), validCmd()),
    ).rejects.toThrow(InternalServerError);
  });

  it("does not persist when the name is taken", async () => {
    const { command, validator, repository } = setup();

    validator.result = {
      legalNameTaken: false,
      nameTaken: true,
      phoneTaken: false,
      taxIdTaken: false,
      slugTaken: false,
    };

    await expect(
      command.execute(UUID.generate().toString(), validCmd()),
    ).rejects.toThrow(OrganizationAlreadyExistsException);

    expect(repository.getAll()).toHaveLength(0);
  });
});