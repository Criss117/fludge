import { describe, expect, it, mock } from "bun:test";

mock.module("@fludge/db", () => ({ dbConnection: {} }));

const updateOrganizationMock = mock(async () => ({}));

mock.module("@fludge/auth", () => ({
  auth: {
    api: {
      updateOrganization: updateOrganizationMock,
    },
  },
}));

const {
  UpdateOrganizationCommand,
  updateOrganizationCommand,
} = await import(
  "@fludge/api/modules/iam/organizations/application/commands/update-organization.command"
);
import type { PGOrganizationCommandsRepository } from "@fludge/api/modules/iam/organizations/infrastructure/repositories/pg-organization-commands.repository";
import { ok, err } from "@fludge/utils/trycatch";

// ---------------------------------------------------------------------------
// Schema tests — updateOrganizationCommand reuses registerOrganizationCommand
// ---------------------------------------------------------------------------

const validOrg = {
  name: "Aasddasdsa",
  phone: "123456789",
  legalName: "Razón Social SA",
  taxId: "123456789",
  address: "Calle Falsa 123",
};

describe("updateOrganizationCommand schema — required fields (PUT semantics)", () => {
  it("accepts a fully valid payload", () => {
    expect(updateOrganizationCommand.safeParse(validOrg).success).toBe(true);
  });

  it("rejects missing name", () => {
    const { name: _name, ...rest } = validOrg;
    expect(updateOrganizationCommand.safeParse(rest).success).toBe(false);
  });

  it("rejects missing phone", () => {
    const { phone: _phone, ...rest } = validOrg;
    expect(updateOrganizationCommand.safeParse(rest).success).toBe(false);
  });

  it("rejects missing legalName", () => {
    const { legalName: _legalName, ...rest } = validOrg;
    expect(updateOrganizationCommand.safeParse(rest).success).toBe(false);
  });

  it("rejects missing taxId", () => {
    const { taxId: _taxId, ...rest } = validOrg;
    expect(updateOrganizationCommand.safeParse(rest).success).toBe(false);
  });

  it("rejects missing address", () => {
    const { address: _address, ...rest } = validOrg;
    expect(updateOrganizationCommand.safeParse(rest).success).toBe(false);
  });

  it("rejects name shorter than 3 chars", () => {
    const result = updateOrganizationCommand.safeParse({ ...validOrg, name: "ab" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "name");
      expect(issue?.message).toBe("El nombre es muy corto");
    }
  });

  it("rejects address shorter than 5 chars", () => {
    const result = updateOrganizationCommand.safeParse({ ...validOrg, address: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "address");
      expect(issue?.message).toBe("La dirección es muy corta");
    }
  });
});

// ---------------------------------------------------------------------------
// Handler tests
// ---------------------------------------------------------------------------

type ExistingOrg = {
  id: string;
  name: string;
  slug: string;
  legalName: string;
  phone: string;
  taxId: string;
  address: string;
};

function makeExistingOrg(overrides: Partial<ExistingOrg> = {}): ExistingOrg {
  return {
    id: "org-1",
    name: "Old Name",
    slug: "old-name",
    legalName: "Old Legal Name",
    phone: "999999999",
    taxId: "888888888",
    address: "Old Address 1",
    ...overrides,
  };
}

function setup(overrides: {
  findOneResult?: ExistingOrg | null;
  findOneError?: Error;
  updateOrgResult?: any;
  updateOrgError?: Error;
} = {}) {
  const findOneMock = mock(async () => {
    if (overrides.findOneError) return err(overrides.findOneError);
    return ok(
      overrides.findOneResult === undefined ? makeExistingOrg() : overrides.findOneResult,
    );
  });

  let capturedHistory: any;
  const saveHistoryMock = mock(async (values: any) => {
    capturedHistory = values;
    return ok(null);
  });

  const repo = {
    findOne: findOneMock,
    saveHistory: saveHistoryMock,
  } as unknown as PGOrganizationCommandsRepository;

  const cmd = new UpdateOrganizationCommand(repo);

  if (overrides.updateOrgResult !== undefined || overrides.updateOrgError) {
    updateOrganizationMock.mockImplementation(
      async () =>
        overrides.updateOrgError
          ? Promise.reject(overrides.updateOrgError)
          : overrides.updateOrgResult,
    );
  }

  return { cmd, findOneMock, saveHistoryMock, getCapturedHistory: () => capturedHistory };
}

const updatedOrg = {
  id: "org-1",
  name: "Aasddasdsa",
  slug: "aasddasdsa",
  legalName: "Razón Social SA",
  phone: "123456789",
  taxId: "123456789",
  address: "Calle Falsa 123",
};

const validCmd = {
  ...validOrg,
  organizationId: "org-1",
  changesBy: { memberId: "mem-1", name: "Alice", email: "alice@example.com" },
};

describe("UpdateOrganizationCommand handler", () => {
  it("updates organization and saves history on success", async () => {
    updateOrganizationMock.mockResolvedValue(updatedOrg);

    const { cmd, saveHistoryMock, getCapturedHistory } = setup();

    const result = await cmd.execute(validCmd, new Headers());

    expect(updateOrganizationMock).toHaveBeenCalledTimes(1);
    expect(updateOrganizationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          organizationId: "org-1",
          data: expect.objectContaining({
            name: "Aasddasdsa",
            slug: "aasddasdsa",
          }),
        }),
      }),
    );

    expect(saveHistoryMock).toHaveBeenCalledTimes(1);
    const history = getCapturedHistory();
    expect(history.organizationId).toBe("org-1");
    expect(history.action).toBe("update");
    expect(history.actorId).toBe("mem-1");

    expect(result).toEqual(expect.objectContaining({ id: "org-1", name: "Aasddasdsa" }));
  });

  it("throws NOT_FOUND when organization does not exist", async () => {
    updateOrganizationMock.mockResolvedValue(updatedOrg);

    const { cmd } = setup({ findOneResult: null });

    try {
      await cmd.execute(validCmd, new Headers());
      expect.unreachable("Expected NOT_FOUND");
    } catch (error: any) {
      expect(error.code).toBe("NOT_FOUND");
    }
  });

  it("throws INTERNAL_SERVER_ERROR when findOne returns error", async () => {
    updateOrganizationMock.mockResolvedValue(updatedOrg);

    const { cmd } = setup({ findOneError: new Error("DB down") });

    try {
      await cmd.execute(validCmd, new Headers());
      expect.unreachable("Expected INTERNAL_SERVER_ERROR");
    } catch (error: any) {
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("throws CONFLICT when auth.api.updateOrganization rejects", async () => {
    updateOrganizationMock.mockRejectedValue(new Error("Auth conflict"));

    const { cmd } = setup();

    try {
      await cmd.execute(validCmd, new Headers());
      expect.unreachable("Expected CONFLICT");
    } catch (error: any) {
      expect(error.code).toBe("CONFLICT");
    }
  });

  it("includes before and after snapshots in the saved history", async () => {
    const existing = makeExistingOrg({ name: "Old Name" });
    updateOrganizationMock.mockResolvedValue(updatedOrg);

    const { cmd, getCapturedHistory } = setup({ findOneResult: existing });

    await cmd.execute(validCmd, new Headers());

    const history = getCapturedHistory();
    expect(history.before).toEqual(expect.objectContaining({ name: "Old Name" }));
    expect(history.after).toEqual(expect.objectContaining({ name: "Aasddasdsa" }));
  });
});