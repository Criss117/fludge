import { describe, expect, it, mock } from "bun:test";
import { OrganizationUniquenessValidator } from "@fludge/api/modules/iam/organization/application/services/organization-uniqueness-validator.service";
import { err, ok, type Result } from "@fludge/utils/trycatch";
import { PgOrganizationRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-organization.repository";
import { RegisterOrganizationCommand } from "@fludge/api/modules/iam/organization/application/commands/register-organization.commad";
import { Slug } from "@fludge/utils/slugify";
import { OrganizationAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/organization-already-exists.exception";

type ValidateUniqueFieldsReturnType = ReturnType<
  OrganizationUniquenessValidator["validateUniqueFields"]
>;

type SaveReturnType = ReturnType<PgOrganizationRepository["save"]>;

function makeValidator(response?: {
  legalNameTaken?: boolean;
  nameTaken?: boolean;
  phoneTaken?: boolean;
  taxIdTaken?: boolean;
  slugTaken?: boolean;
}) {
  return {
    validateUniqueFields: mock(
      (): ValidateUniqueFieldsReturnType =>
        Promise.resolve(
          ok({
            legalNameTaken: false,
            nameTaken: false,
            phoneTaken: false,
            taxIdTaken: false,
            slugTaken: false,
            ...response,
          }),
        ),
    ),
  };
}

function makeRepository(saveResult: Result<undefined, Error> = ok(undefined)) {
  return {
    save: mock((): SaveReturnType => Promise.resolve(saveResult)),
  };
}

const validCMD = {
  address: "Main Street",
  legalName: "Acme Corporation",
  name: "Acme Corporation",
  phone: "555-0100",
  taxId: "TAX-1",
};

describe("RegisterOrganizationCommand", () => {
  const validator = makeValidator();
  const repository = makeRepository();

  it("creates a new organization when the command is valid", async () => {
    const command = new RegisterOrganizationCommand(
      validator as any,
      repository as any,
    );

    const result = await command.execute("root-user-1", validCMD);

    expect(result.name).toBe(validCMD.name);
    expect(result.slug).toBe(new Slug(validCMD.name).toString());
    expect(validator.validateUniqueFields).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it("throws CONFLICT if the name is already taken", async () => {
    const validator = makeValidator({ nameTaken: true });
    const repository = makeRepository();
    const command = new RegisterOrganizationCommand(
      validator as any,
      repository as any,
    );

    await expect(command.execute("user-1", validCMD)).rejects.toThrow(
      OrganizationAlreadyExistsException,
    );
    expect(validator.validateUniqueFields).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(0);
  });

  it("throws CONFLICT if the taxId is already taken", async () => {
    const validator = makeValidator({ taxIdTaken: true });
    const repository = makeRepository();
    const command = new RegisterOrganizationCommand(
      validator as any,
      repository as any,
    );

    await expect(command.execute("user-1", validCMD)).rejects.toThrow(
      OrganizationAlreadyExistsException,
    );
    expect(validator.validateUniqueFields).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(0);
  });

  it("throws CONFLICT if the phone is already taken", async () => {
    const validator = makeValidator({ phoneTaken: true });
    const repository = makeRepository();
    const command = new RegisterOrganizationCommand(
      validator as any,
      repository as any,
    );

    await expect(command.execute("user-1", validCMD)).rejects.toThrow(
      OrganizationAlreadyExistsException,
    );
    expect(validator.validateUniqueFields).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(0);
  });

  it("throws CONFLICT if the legalName is already taken", async () => {
    const validator = makeValidator({ legalNameTaken: true });
    const repository = makeRepository();
    const command = new RegisterOrganizationCommand(
      validator as any,
      repository as any,
    );

    await expect(command.execute("user-1", validCMD)).rejects.toThrow(
      OrganizationAlreadyExistsException,
    );
    expect(validator.validateUniqueFields).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(0);
  });

  it("throws INTERNAL_SERVER_ERROR if the uniqueness validation fails", async () => {
    const validator = {
      validateUniqueFields: mock(() => Promise.resolve(err(new Error("boom")))),
    };
    const repository = makeRepository();
    const command = new RegisterOrganizationCommand(
      validator as any,
      repository as any,
    );

    await expect(command.execute("user-1", validCMD)).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(validator.validateUniqueFields).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(0);
  });

  it("throws INTERNAL_SERVER_ERROR if the save fails", async () => {
    const validator = makeValidator();
    const repository = makeRepository(err(new Error("boom")));
    const command = new RegisterOrganizationCommand(
      validator as any,
      repository as any,
    );

    await expect(command.execute("user-1", validCMD)).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(validator.validateUniqueFields).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it("adds the Administrators group with all permissions", async () => {
    const validator = makeValidator();
    const repository = makeRepository();
    const command = new RegisterOrganizationCommand(
      validator as any,
      repository as any,
    );

    const result = await command.execute("user-1", validCMD);

    expect(result.groups.some((g) => g.name === "Administradores")).toBe(true);
    expect(validator.validateUniqueFields).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
