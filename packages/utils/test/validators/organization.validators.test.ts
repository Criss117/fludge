import { describe, expect, it } from "bun:test";

import {
  registerOrganizationValidator,
  updateOrganizationValidator,
  addMemberValidator,
} from "@fludge/utils/validators/organization.validators";

const VALID_UUID = "00000000-0000-4000-8000-000000000001";

function validRegister(overrides?: Partial<ReturnType<typeof registerOrganizationValidator.parse>>) {
  return {
    name: "Fludge Corp",
    phone: "573001234567",
    legalName: "Fludge Corp S.A.",
    taxId: "900123456",
    address: "Calle 123, Bogotá",
    ...overrides,
  };
}

describe("registerOrganizationValidator", () => {
  it("accepts a valid registration", () => {
    expect(registerOrganizationValidator.parse(validRegister())).toEqual(
      validRegister(),
    );
  });

  it("trims string fields", () => {
    const result = registerOrganizationValidator.parse(
      validRegister({ name: "  Fludge Corp  " }),
    );

    expect(result.name).toBe("Fludge Corp");
  });

  it("rejects a short name", () => {
    expect(() =>
      registerOrganizationValidator.parse(validRegister({ name: "Abc" })),
    ).toThrow();
  });

  it("rejects a short legalName", () => {
    expect(() =>
      registerOrganizationValidator.parse(validRegister({ legalName: "AB" })),
    ).toThrow();
  });

  it("rejects a short taxId", () => {
    expect(() =>
      registerOrganizationValidator.parse(validRegister({ taxId: "12345678" })),
    ).toThrow();
  });

  it("rejects a short address", () => {
    expect(() =>
      registerOrganizationValidator.parse(validRegister({ address: "Call" })),
    ).toThrow();
  });

  it("rejects a missing phone", () => {
    expect(() =>
      registerOrganizationValidator.parse(validRegister({ phone: "" })),
    ).toThrow();
  });
});

describe("updateOrganizationValidator", () => {
  it("accepts a partial update", () => {
    const result = updateOrganizationValidator.parse({ name: "Nuevo Nombre" });

    expect(result.name).toBe("Nuevo Nombre");
  });

  it("accepts an empty object", () => {
    expect(updateOrganizationValidator.parse({})).toEqual({});
  });

  it("rejects an invalid phone", () => {
    expect(() => updateOrganizationValidator.parse({ phone: "abc" })).toThrow();
  });

  it("rejects a short address", () => {
    expect(() =>
      updateOrganizationValidator.parse({ address: "Call" }),
    ).toThrow();
  });
});

describe("addMemberValidator", () => {
  it("accepts a valid user id", () => {
    expect(addMemberValidator.parse({ userId: VALID_UUID })).toEqual({
      userId: VALID_UUID,
    });
  });

  it("rejects an invalid user id", () => {
    expect(() => addMemberValidator.parse({ userId: "nope" })).toThrow();
  });
});