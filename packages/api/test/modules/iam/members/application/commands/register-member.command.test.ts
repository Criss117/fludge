import { describe, expect, it, mock, beforeEach } from "bun:test";

mock.module("@fludge/db", () => ({ dbConnection: {} }));

const signUpEmailMock = mock(async () => ({}));
const addMemberMock = mock(async () => ({}));

mock.module("@fludge/auth", () => ({
  auth: {
    api: {
      signUpEmail: signUpEmailMock,
      addMember: addMemberMock,
    },
  },
}));

const {
  RegisterMemberCommand,
  registerMemberCommand,
} = await import(
  "@fludge/api/modules/iam/members/application/commands/register-member.command"
);
import type { EmailsAlreadyExistsQuery } from "@fludge/api/modules/iam/auth/application/queries/emails-already-exists.query";

// ---------------------------------------------------------------------------
// Schema tests
// ---------------------------------------------------------------------------

const validMember = {
  email: "test@example.com",
  password: "password123",
  name: "Alice Anderson",
  phone: "123456789",
};

describe("registerMemberCommand schema — required fields", () => {
  it("accepts a fully valid payload", () => {
    expect(registerMemberCommand.safeParse(validMember).success).toBe(true);
  });

  it("rejects missing email", () => {
    const { email: _email, ...rest } = validMember;
    expect(registerMemberCommand.safeParse(rest).success).toBe(false);
  });

  it("rejects missing password", () => {
    const { password: _password, ...rest } = validMember;
    expect(registerMemberCommand.safeParse(rest).success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _name, ...rest } = validMember;
    expect(registerMemberCommand.safeParse(rest).success).toBe(false);
  });

  it("rejects missing phone", () => {
    const { phone: _phone, ...rest } = validMember;
    expect(registerMemberCommand.safeParse(rest).success).toBe(false);
  });
});

describe("registerMemberCommand schema — length constraints", () => {
  it("rejects password shorter than 8 chars", () => {
    const result = registerMemberCommand.safeParse({ ...validMember, password: "short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "password");
      expect(issue?.message).toBe("La contraseña es muy corta");
    }
  });

  it("rejects password longer than 50 chars", () => {
    const result = registerMemberCommand.safeParse({
      ...validMember,
      password: "x".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("rejects name shorter than 3 chars", () => {
    const result = registerMemberCommand.safeParse({ ...validMember, name: "ab" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "name");
      expect(issue?.message).toBe("El nombre es muy corto");
    }
  });

  it("rejects phone shorter than 9 chars", () => {
    const result = registerMemberCommand.safeParse({ ...validMember, phone: "123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "phone");
      expect(issue?.message).toBe("El teléfono es muy corto");
    }
  });

  it("rejects an invalid email format", () => {
    const result = registerMemberCommand.safeParse({ ...validMember, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "email");
      expect(issue?.message).toBe("El email es requerido");
    }
  });
});

// ---------------------------------------------------------------------------
// Handler tests
// ---------------------------------------------------------------------------

function setup(exists = false) {
  const emailsAlreadyExistsQuery = {
    execute: mock(async () => ({ exists })),
  } as unknown as EmailsAlreadyExistsQuery;

  const cmd = new RegisterMemberCommand(emailsAlreadyExistsQuery);

  return { cmd, emailsAlreadyExistsQuery };
}

const signUpResult = {
  user: { id: "user-1", email: "test@example.com", name: "Alice Anderson" },
};

const addMemberResult = {
  id: "mem-1",
  organizationId: "org-1",
  userId: "user-1",
  role: "member",
};

const validCmd = {
  ...validMember,
  organizationId: "org-1",
  assignedBy: "mem-admin",
};

describe("RegisterMemberCommand handler", () => {
  beforeEach(() => {
    signUpEmailMock.mockClear();
    addMemberMock.mockClear();
  });

  it("creates user and adds member when email does not exist", async () => {
    signUpEmailMock.mockResolvedValue(signUpResult);
    addMemberMock.mockResolvedValue(addMemberResult);

    const { cmd } = setup(false);

    const result = await cmd.execute(validCmd, new Headers());

    expect(signUpEmailMock).toHaveBeenCalledTimes(1);
    expect(signUpEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          email: "test@example.com",
          isRoot: false,
        }),
      }),
    );

    expect(addMemberMock).toHaveBeenCalledTimes(1);
    expect(addMemberMock).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          organizationId: "org-1",
          userId: "user-1",
          role: "member",
          assignedBy: "mem-admin",
        }),
      }),
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: "mem-1",
        user: expect.objectContaining({ id: "user-1" }),
        assignedBy: "mem-admin",
      }),
    );
  });

  it("throws CONFLICT when email already exists", async () => {
    const { cmd } = setup(true);

    try {
      await cmd.execute(validCmd, new Headers());
      expect.unreachable("Expected CONFLICT");
    } catch (error: any) {
      expect(error.code).toBe("CONFLICT");
    }

    expect(signUpEmailMock).not.toHaveBeenCalled();
  });

  it("throws INTERNAL_SERVER_ERROR when signUpEmail rejects", async () => {
    signUpEmailMock.mockRejectedValue(new Error("Auth failure"));
    addMemberMock.mockResolvedValue(addMemberResult);

    const { cmd } = setup(false);

    try {
      await cmd.execute(validCmd, new Headers());
      expect.unreachable("Expected INTERNAL_SERVER_ERROR");
    } catch (error: any) {
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }

    expect(addMemberMock).not.toHaveBeenCalled();
  });

  it("throws INTERNAL_SERVER_ERROR when addMember rejects", async () => {
    signUpEmailMock.mockResolvedValue(signUpResult);
    addMemberMock.mockRejectedValue(new Error("Add member failure"));

    const { cmd } = setup(false);

    try {
      await cmd.execute(validCmd, new Headers());
      expect.unreachable("Expected INTERNAL_SERVER_ERROR");
    } catch (error: any) {
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("forwards headers to auth.api.signUpEmail and addMember", async () => {
    signUpEmailMock.mockResolvedValue(signUpResult);
    addMemberMock.mockResolvedValue(addMemberResult);

    const { cmd } = setup(false);

    const headers = new Headers({ "x-test": "value" });
    await cmd.execute(validCmd, headers);

    expect(signUpEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ headers }),
    );
    expect(addMemberMock).toHaveBeenCalledWith(
      expect.objectContaining({ headers }),
    );
  });
});