import { describe, expect, it, mock } from "bun:test";

mock.module("@fludge/db", () => ({ dbConnection: {} }));

const createOrganizationMock = mock(async () => ({}));

mock.module("@fludge/auth", () => ({
  auth: {
    api: {
      createOrganization: createOrganizationMock,
    },
  },
}));

const {
  RegisterOrganizationCommand,
  registerOrganizationCommand,
} = await import(
  "@fludge/api/modules/iam/organizations/application/commands/register-organization.command"
);
import type { EventBus } from "@fludge/api/modules/shared/domain/event-bus";

// ---------------------------------------------------------------------------
// Schema tests
// ---------------------------------------------------------------------------

const validOrg = {
  name: "Aasddasdsa",
  phone: "123456789",
  legalName: "Razón Social SA",
  taxId: "123456789",
  address: "Calle Falsa 123",
};

describe("registerOrganizationCommand schema — required fields", () => {
  it("accepts a fully valid payload", () => {
    expect(registerOrganizationCommand.safeParse(validOrg).success).toBe(true);
  });

  it("rejects missing name", () => {
    const { name: _name, ...withoutName } = validOrg;
    expect(registerOrganizationCommand.safeParse(withoutName).success).toBe(false);
  });

  it("rejects missing phone", () => {
    const { phone: _phone, ...withoutPhone } = validOrg;
    expect(registerOrganizationCommand.safeParse(withoutPhone).success).toBe(false);
  });

  it("rejects missing legalName", () => {
    const { legalName: _legalName, ...withoutLegalName } = validOrg;
    expect(registerOrganizationCommand.safeParse(withoutLegalName).success).toBe(false);
  });

  it("rejects missing taxId", () => {
    const { taxId: _taxId, ...withoutTaxId } = validOrg;
    expect(registerOrganizationCommand.safeParse(withoutTaxId).success).toBe(false);
  });

  it("rejects missing address", () => {
    const { address: _address, ...withoutAddress } = validOrg;
    expect(registerOrganizationCommand.safeParse(withoutAddress).success).toBe(false);
  });
});

describe("registerOrganizationCommand schema — length constraints", () => {
  it("rejects name shorter than 3 chars", () => {
    const result = registerOrganizationCommand.safeParse({ ...validOrg, name: "ab" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "name");
      expect(issue?.message).toBe("El nombre es muy corto");
    }
  });

  it("rejects name longer than 50 chars", () => {
    const result = registerOrganizationCommand.safeParse({
      ...validOrg,
      name: "x".repeat(51),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "name");
      expect(issue?.message).toBe("El nombre es muy largo");
    }
  });

  it("rejects phone shorter than 9 chars", () => {
    const result = registerOrganizationCommand.safeParse({ ...validOrg, phone: "123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "phone");
      expect(issue?.message).toBe("El teléfono es muy corto");
    }
  });

  it("rejects phone longer than 15 chars", () => {
    const result = registerOrganizationCommand.safeParse({
      ...validOrg,
      phone: "1".repeat(16),
    });
    expect(result.success).toBe(false);
  });

  it("rejects address shorter than 5 chars", () => {
    const result = registerOrganizationCommand.safeParse({ ...validOrg, address: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "address");
      expect(issue?.message).toBe("La dirección es muy corta");
    }
  });

  it("rejects legalName shorter than 3 chars", () => {
    const result = registerOrganizationCommand.safeParse({
      ...validOrg,
      legalName: "ab",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "legalName");
      expect(issue?.message).toBe("La razón social es muy corta");
    }
  });

  it("rejects taxId shorter than 9 chars", () => {
    const result = registerOrganizationCommand.safeParse({ ...validOrg, taxId: "123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "taxId");
      expect(issue?.message).toBe("El NIT es muy corto");
    }
  });
});

// ---------------------------------------------------------------------------
// Handler tests
// ---------------------------------------------------------------------------

function setup(overrides: { createOrgResult?: any; createOrgError?: Error } = {}) {
  const dispatchMock = mock(async () => {});

  const eventBus = {
    dispatch: dispatchMock,
  } as unknown as EventBus;

  const cmd = new RegisterOrganizationCommand(eventBus);

  if (overrides.createOrgResult !== undefined || overrides.createOrgError) {
    createOrganizationMock.mockImplementation(
      async () =>
        overrides.createOrgError
          ? Promise.reject(overrides.createOrgError)
          : overrides.createOrgResult,
    );
  }

  return { cmd, dispatchMock, eventBus };
}

const validCmd = {
  ...validOrg,
  registeredBy: { userId: "u1", name: "Alice", email: "alice@example.com" },
};

const createdOrg = {
  id: "org-1",
  name: "Aasddasdsa",
  slug: "aasddasdsa",
  members: [{ id: "mem-1" }],
};

describe("RegisterOrganizationCommand handler", () => {
  it("creates organization and dispatches OrganizationRegisteredEvent", async () => {
    createOrganizationMock.mockResolvedValue(createdOrg);

    const { cmd, dispatchMock } = setup();

    const result = await cmd.execute(validCmd, new Headers());

    expect(createOrganizationMock).toHaveBeenCalledTimes(1);
    expect(createOrganizationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          name: "Aasddasdsa",
          legalName: "Razón Social SA",
          slug: "aasddasdsa",
        }),
      }),
    );
    expect(dispatchMock).toHaveBeenCalledTimes(1);

    expect(result).toEqual(expect.objectContaining({ id: "org-1" }));
  });

  it("passes the correct member info to OrganizationRegisteredEvent", async () => {
    createOrganizationMock.mockResolvedValue(createdOrg);

    const { cmd, dispatchMock } = setup();

    await cmd.execute(validCmd, new Headers());

    expect(dispatchMock).toHaveBeenCalledTimes(1);
    const dispatchedEvent = dispatchMock.mock.calls[0][0];
    expect(dispatchedEvent.eventName).toBe("organization:registered");
    expect(dispatchedEvent.organizationId).toBe("org-1");
    expect(dispatchedEvent.createdBy).toEqual({
      memberId: "mem-1",
      name: "Alice",
      email: "alice@example.com",
    });
  });

  it("throws INTERNAL_SERVER_ERROR when createOrganization rejects", async () => {
    createOrganizationMock.mockRejectedValue(new Error("Better Auth failure"));

    const { cmd } = setup();

    try {
      await cmd.execute(validCmd, new Headers());
      expect.unreachable("Expected INTERNAL_SERVER_ERROR");
    } catch (error: any) {
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("forwards headers to auth.api.createOrganization", async () => {
    createOrganizationMock.mockResolvedValue(createdOrg);

    const { cmd } = setup();

    const headers = new Headers({ "x-test": "value" });
    await cmd.execute(validCmd, headers);

    expect(createOrganizationMock).toHaveBeenCalledWith(
      expect.objectContaining({ headers }),
    );
  });
});