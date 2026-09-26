import { describe, expect, it } from "bun:test";
import type { ZodType } from "zod";

import {
  addMemberValidator,
  registerOrganizationValidator,
  updateOrganizationValidator,
} from "../../src/validators/organization.validators";

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

const VALID_ORGANIZATION = {
  name: "Mi Empresa",
  phone: "573001234567",
  legalName: "Mi Empresa SAS",
  taxId: "900123456",
  address: "Calle 123 #45-67",
};

describe("registerOrganizationValidator", () => {
  it("accepts a complete valid payload", () => {
    const data = expectParsed(registerOrganizationValidator, VALID_ORGANIZATION);
    expect(data.name).toBe("Mi Empresa");
    expect(data.phone).toBe("573001234567");
    expect(data.legalName).toBe("Mi Empresa SAS");
    expect(data.taxId).toBe("900123456");
    expect(data.address).toBe("Calle 123 #45-67");
  });

  it("trims every field", () => {
    const data = expectParsed(registerOrganizationValidator, {
      name: "  Mi Empresa  ",
      phone: "  573001234567  ",
      legalName: "  Mi Empresa SAS  ",
      taxId: "  900123456  ",
      address: "  Calle 123 #45-67  ",
    });
    expect(data.name).toBe("Mi Empresa");
    expect(data.phone).toBe("573001234567");
    expect(data.legalName).toBe("Mi Empresa SAS");
    expect(data.taxId).toBe("900123456");
    expect(data.address).toBe("Calle 123 #45-67");
  });

  it("accepts legalName at its boundaries (3 and 50 characters)", () => {
    expectParsed(registerOrganizationValidator, {
      ...VALID_ORGANIZATION,
      legalName: "a".repeat(3),
    });
    expectParsed(registerOrganizationValidator, {
      ...VALID_ORGANIZATION,
      legalName: "a".repeat(50),
    });
  });

  it("accepts taxId at its boundaries (9 and 15 characters)", () => {
    expectParsed(registerOrganizationValidator, {
      ...VALID_ORGANIZATION,
      taxId: "a".repeat(9),
    });
    expectParsed(registerOrganizationValidator, {
      ...VALID_ORGANIZATION,
      taxId: "a".repeat(15),
    });
  });

  it("accepts address at its boundaries (5 and 50 characters)", () => {
    expectParsed(registerOrganizationValidator, {
      ...VALID_ORGANIZATION,
      address: "a".repeat(5),
    });
    expectParsed(registerOrganizationValidator, {
      ...VALID_ORGANIZATION,
      address: "a".repeat(50),
    });
  });

  it("rejects a name shorter than 5 characters", () => {
    expect(expectFirstIssue(registerOrganizationValidator, {
      ...VALID_ORGANIZATION,
      name: "ab",
    })).toBe("validators.name.min_length");
  });

  it("rejects an invalid phone", () => {
    expect(expectFirstIssue(registerOrganizationValidator, {
      ...VALID_ORGANIZATION,
      phone: "123",
    })).toBe("validators.phone.min_length");
  });

  it("rejects a legalName shorter than 3 characters", () => {
    expect(expectFirstIssue(registerOrganizationValidator, {
      ...VALID_ORGANIZATION,
      legalName: "ab",
    })).toBe("validators.legal_name.min_length");
  });

  it("rejects a legalName longer than 50 characters", () => {
    expect(expectFirstIssue(registerOrganizationValidator, {
      ...VALID_ORGANIZATION,
      legalName: "a".repeat(51),
    })).toBe("validators.legal_name.max_length");
  });

  it("rejects a taxId shorter than 9 characters", () => {
    expect(expectFirstIssue(registerOrganizationValidator, {
      ...VALID_ORGANIZATION,
      taxId: "12345678",
    })).toBe("validators.tax_id.min_length");
  });

  it("rejects a taxId longer than 15 characters", () => {
    expect(expectFirstIssue(registerOrganizationValidator, {
      ...VALID_ORGANIZATION,
      taxId: "a".repeat(16),
    })).toBe("validators.tax_id.max_length");
  });

  it("rejects an address shorter than 5 characters", () => {
    expect(expectFirstIssue(registerOrganizationValidator, {
      ...VALID_ORGANIZATION,
      address: "x",
    })).toBe("validators.address.min_length");
  });

  it("rejects an address longer than 50 characters", () => {
    expect(expectFirstIssue(registerOrganizationValidator, {
      ...VALID_ORGANIZATION,
      address: "a".repeat(51),
    })).toBe("validators.address.max_length");
  });

  it("rejects an empty payload", () => {
    const result = registerOrganizationValidator.safeParse({});
    expect(result.success).toBe(false);
  });

  it("strips unknown keys", () => {
    const data = expectParsed(registerOrganizationValidator, {
      ...VALID_ORGANIZATION,
      extra: "ignored",
    });
    expect("extra" in data).toBe(false);
  });
});

describe("updateOrganizationValidator", () => {
  // NOTE: the current source only exposes name, phone and address as optional
  // fields (legalName and taxId are not part of the update schema).
  it("accepts an empty object (all fields optional)", () => {
    expect(expectParsed(updateOrganizationValidator, {})).toEqual({});
  });

  it("accepts a partial update and trims fields", () => {
    const data = expectParsed(updateOrganizationValidator, {
      name: "  Nuevo Nombre  ",
    });
    expect(data.name).toBe("Nuevo Nombre");
  });

  it("accepts a full update", () => {
    const data = expectParsed(updateOrganizationValidator, {
      name: "Nuevo Nombre",
      phone: "573001234567",
      address: "Nueva dirección 123",
    });
    expect(data.name).toBe("Nuevo Nombre");
    expect(data.phone).toBe("573001234567");
    expect(data.address).toBe("Nueva dirección 123");
  });

  it("rejects an invalid name when provided", () => {
    expect(expectFirstIssue(updateOrganizationValidator, { name: "ab" })).toBe(
      "validators.name.min_length",
    );
  });

  it("rejects an invalid phone when provided", () => {
    expect(expectFirstIssue(updateOrganizationValidator, { phone: "abc" })).toBe(
      "validators.phone.min_length",
    );
  });

  it("rejects an invalid address when provided", () => {
    expect(expectFirstIssue(updateOrganizationValidator, { address: "x" })).toBe(
      "validators.address.min_length",
    );
  });

  it("strips unknown keys", () => {
    const data = expectParsed(updateOrganizationValidator, {
      name: "Nuevo Nombre",
      extra: "ignored",
    });
    expect("extra" in data).toBe(false);
  });
});

describe("addMemberValidator", () => {
  it("accepts a valid user id", () => {
    expect(expectParsed(addMemberValidator, { userId: VALID_UUID }).userId).toBe(
      VALID_UUID,
    );
  });

  it("rejects an invalid user id", () => {
    expect(expectFirstIssue(addMemberValidator, { userId: "not-a-uuid" })).toBe(
      "validators.uuid.invalid",
    );
  });

  it("rejects a missing user id", () => {
    expect(expectFirstIssue(addMemberValidator, {})).toBe(
      "validators.uuid.invalid",
    );
  });
});