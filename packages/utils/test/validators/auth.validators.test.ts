import { describe, expect, it } from "bun:test";

import {
  signInValidator,
  signUpValidator,
  updateUserInfoValidator,
  setActiveOrganizationValidator,
} from "@fludge/utils/validators/auth.validators";

const VALID_UUID = "00000000-0000-4000-8000-000000000001";

function validSignUp(overrides?: Partial<ReturnType<typeof signUpValidator.parse>>) {
  return {
    name: "Juan Pérez",
    email: "juan@example.com",
    password: "password123",
    phone: "573001234567",
    ...overrides,
  };
}

describe("signInValidator", () => {
  it("accepts a valid sign in", () => {
    const result = signInValidator.parse({
      email: "juan@example.com",
      password: "password123",
    });

    expect(result.email).toBe("juan@example.com");
  });

  it("rejects a short password", () => {
    expect(() =>
      signInValidator.parse({ email: "juan@example.com", password: "short" }),
    ).toThrow();
  });

  it("rejects a short email (uses nameSchema)", () => {
    expect(() =>
      signInValidator.parse({ email: "ab", password: "password123" }),
    ).toThrow();
  });
});

describe("signUpValidator", () => {
  it("accepts a valid sign up", () => {
    expect(signUpValidator.parse(validSignUp())).toEqual(validSignUp());
  });

  it("rejects an invalid email", () => {
    expect(() =>
      signUpValidator.parse(validSignUp({ email: "not-an-email" })),
    ).toThrow();
  });

  it("rejects a short name", () => {
    expect(() => signUpValidator.parse(validSignUp({ name: "A" }))).toThrow();
  });

  it("rejects a short password", () => {
    expect(() =>
      signUpValidator.parse(validSignUp({ password: "short" })),
    ).toThrow();
  });

  it("rejects an invalid phone", () => {
    expect(() =>
      signUpValidator.parse(validSignUp({ phone: "abc" })),
    ).toThrow();
  });
});

describe("updateUserInfoValidator", () => {
  it("accepts a partial update", () => {
    expect(updateUserInfoValidator.parse({ name: "Nuevo" })).toEqual({
      name: "Nuevo",
    });
  });

  it("accepts an empty object", () => {
    expect(updateUserInfoValidator.parse({})).toEqual({});
  });
});

describe("setActiveOrganizationValidator", () => {
  it("accepts a valid organization id", () => {
    expect(setActiveOrganizationValidator.parse({ organizationId: VALID_UUID })).toEqual({
      organizationId: VALID_UUID,
    });
  });

  it("rejects an invalid organization id", () => {
    expect(() =>
      setActiveOrganizationValidator.parse({ organizationId: "nope" }),
    ).toThrow();
  });
});