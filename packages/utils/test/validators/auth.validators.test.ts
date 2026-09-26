import { describe, expect, it } from "bun:test";
import type { ZodType } from "zod";

import {
  setActiveOrganizationValidator,
  signInValidator,
  signUpValidator,
  updateUserInfoValidator,
} from "../../src/validators/auth.validators";

const VALID_UUID = "00000000-0000-4000-8000-000000000001";

function expectParsed<TSchema extends ZodType>(
  schema: TSchema,
  value: unknown,
) {
  const result = schema.safeParse(value);
  expect(result.success, `expected success for ${JSON.stringify(value)}`).toBe(
    true,
  );
  if (!result.success) {
    throw new Error(`expected success but got: ${result.error.message}`);
  }
  return result.data;
}

function expectFirstIssue<TSchema extends ZodType>(
  schema: TSchema,
  value: unknown,
): string {
  const result = schema.safeParse(value);
  expect(result.success, `expected failure for ${JSON.stringify(value)}`).toBe(
    false,
  );
  if (result.success) {
    throw new Error(`expected failure for ${JSON.stringify(value)}`);
  }
  return result.error.issues[0]?.message ?? "";
}

const VALID_SIGN_IN = {
  email: "juan@example.com",
  password: "password123",
};

const VALID_SIGN_UP = {
  name: "Juan Pérez",
  email: "juan@example.com",
  password: "password123",
  phone: "573001234567",
};

describe("signInValidator", () => {
  it("accepts valid credentials", () => {
    const data = expectParsed(signInValidator, VALID_SIGN_IN);
    expect(data.email).toBe("juan@example.com");
    expect(data.password).toBe("password123");
  });

  it("trims whitespace from email and password", () => {
    const data = expectParsed(signInValidator, {
      email: "  juan@example.com  ",
      password: "  password123  ",
    });
    expect(data.email).toBe("juan@example.com");
    expect(data.password).toBe("password123");
  });

  it("validates the email field with nameSchema constraints (source quirk, tested as-is)", () => {
    // The source wires nameSchema (5..50 chars) instead of emailSchema.
    expect(expectFirstIssue(signInValidator, {
      email: "ab",
      password: "password123",
    })).toBe("validators.name.min_length");

    expect(expectFirstIssue(signInValidator, {
      email: "x".repeat(51),
      password: "password123",
    })).toBe("validators.name.max_length");
  });

  it("still accepts a well-formed email under nameSchema rules", () => {
    expect(expectParsed(signInValidator, VALID_SIGN_IN).email).toBe(
      "juan@example.com",
    );
  });

  it("rejects a non-string email", () => {
    expect(expectFirstIssue(signInValidator, {
      email: 42,
      password: "password123",
    })).toBe("validators.name.required");
  });

  it("rejects a missing or too-short password", () => {
    expect(expectFirstIssue(signInValidator, { email: "juan@example.com" })).toBe(
      "validators.password.invalid",
    );

    expect(expectFirstIssue(signInValidator, {
      email: "juan@example.com",
      password: "1234567",
    })).toBe("validators.password.min_length");
  });

  it("rejects a missing email", () => {
    expect(expectFirstIssue(signInValidator, { password: "password123" })).toBe(
      "validators.name.required",
    );
  });
});

describe("signUpValidator", () => {
  it("accepts a complete valid payload", () => {
    const data = expectParsed(signUpValidator, VALID_SIGN_UP);
    expect(data.name).toBe("Juan Pérez");
    expect(data.email).toBe("juan@example.com");
    expect(data.password).toBe("password123");
    expect(data.phone).toBe("573001234567");
  });

  it("trims name, password and phone", () => {
    const data = expectParsed(signUpValidator, {
      name: "  Juan Pérez  ",
      email: "juan@example.com",
      password: "  password123  ",
      phone: "  573001234567  ",
    });
    expect(data.name).toBe("Juan Pérez");
    expect(data.password).toBe("password123");
    expect(data.phone).toBe("573001234567");
  });

  it("rejects a name shorter than 5 characters", () => {
    expect(expectFirstIssue(signUpValidator, {
      ...VALID_SIGN_UP,
      name: "ab",
    })).toBe("validators.name.min_length");
  });

  it("rejects an empty name", () => {
    expect(expectFirstIssue(signUpValidator, {
      ...VALID_SIGN_UP,
      name: "",
    })).toBe("validators.name.min_length");
  });

  it("rejects a malformed email", () => {
    expect(expectFirstIssue(signUpValidator, {
      ...VALID_SIGN_UP,
      email: "not-an-email",
    })).toBe("validators.email.invalid");
  });

  it("rejects an empty email", () => {
    expect(expectFirstIssue(signUpValidator, {
      ...VALID_SIGN_UP,
      email: "",
    })).toBe("validators.email.invalid");
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(expectFirstIssue(signUpValidator, {
      ...VALID_SIGN_UP,
      password: "1234567",
    })).toBe("validators.password.min_length");
  });

  it("rejects an invalid phone", () => {
    expect(expectFirstIssue(signUpValidator, {
      ...VALID_SIGN_UP,
      phone: "123",
    })).toBe("validators.phone.min_length");
  });

  it("rejects a non-numeric phone", () => {
    expect(expectFirstIssue(signUpValidator, {
      ...VALID_SIGN_UP,
      phone: "abcdefghijk",
    })).toBe("validators.phone.invalid");
  });

  it("rejects a missing required field", () => {
    expect(expectFirstIssue(signUpValidator, {
      email: "juan@example.com",
      password: "password123",
      phone: "573001234567",
    })).toBe("validators.name.required");
  });
});

describe("updateUserInfoValidator", () => {
  it("accepts an empty object (both fields optional)", () => {
    expect(expectParsed(updateUserInfoValidator, {})).toEqual({});
  });

  it("accepts only a name and trims it", () => {
    expect(
      expectParsed(updateUserInfoValidator, { name: "  Nuevo Nombre  " }).name,
    ).toBe("Nuevo Nombre");
  });

  it("accepts only a phone", () => {
    expect(
      expectParsed(updateUserInfoValidator, { phone: "573001234567" }).phone,
    ).toBe("573001234567");
  });

  it("rejects an invalid name when provided", () => {
    expect(expectFirstIssue(updateUserInfoValidator, { name: "ab" })).toBe(
      "validators.name.min_length",
    );
  });

  it("rejects an invalid phone when provided", () => {
    expect(expectFirstIssue(updateUserInfoValidator, { phone: "abc" })).toBe(
      "validators.phone.min_length",
    );
  });
});

describe("setActiveOrganizationValidator", () => {
  it("accepts a valid organization id", () => {
    expect(
      expectParsed(setActiveOrganizationValidator, {
        organizationId: VALID_UUID,
      }).organizationId,
    ).toBe(VALID_UUID);
  });

  it("rejects an invalid organization id", () => {
    expect(expectFirstIssue(setActiveOrganizationValidator, {
      organizationId: "not-a-uuid",
    })).toBe("validators.uuid.invalid");
  });

  it("rejects a missing organization id", () => {
    expect(expectFirstIssue(setActiveOrganizationValidator, {})).toBe(
      "validators.uuid.invalid",
    );
  });
});