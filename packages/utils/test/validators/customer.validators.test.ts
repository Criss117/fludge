import { describe, expect, it } from "bun:test";
import type { ZodType } from "zod";

import {
  createCustomerValidator,
  creditLimitSchema,
  documentNumberSchema,
  documentTypeSchema,
  updateCustomerValidator,
} from "../../src/validators/customer.validators";

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

describe("documentTypeSchema", () => {
  it("accepts every document type", () => {
    for (const documentType of ["CC", "NIT", "CE"] as const) {
      expect(expectParsed(documentTypeSchema, documentType)).toBe(documentType);
    }
  });

  it("rejects a value outside the enum", () => {
    expect(expectFirstIssue(documentTypeSchema, "TI")).toBe(
      "validators.document_type.invalid",
    );
  });

  it("rejects an empty string, lowercase and non-string values", () => {
    expect(expectFirstIssue(documentTypeSchema, "")).toBe(
      "validators.document_type.invalid",
    );
    expect(expectFirstIssue(documentTypeSchema, "cc")).toBe(
      "validators.document_type.invalid",
    );
    expect(expectFirstIssue(documentTypeSchema, null)).toBe(
      "validators.document_type.invalid",
    );
    expect(expectFirstIssue(documentTypeSchema, 123)).toBe(
      "validators.document_type.invalid",
    );
  });
});

describe("documentNumberSchema", () => {
  it("accepts a document number at the minimum length (5)", () => {
    expect(expectParsed(documentNumberSchema, "a".repeat(5))).toBe(
      "a".repeat(5),
    );
  });

  it("accepts a document number at the maximum length (30)", () => {
    expect(expectParsed(documentNumberSchema, "a".repeat(30))).toBe(
      "a".repeat(30),
    );
  });

  it("trims surrounding whitespace", () => {
    expect(expectParsed(documentNumberSchema, "  1234567890  ")).toBe(
      "1234567890",
    );
  });

  it("rejects a document number shorter than 5 characters", () => {
    expect(expectFirstIssue(documentNumberSchema, "a".repeat(4))).toBe(
      "validators.document_number.min_length",
    );
  });

  it("rejects a document number longer than 30 characters", () => {
    expect(expectFirstIssue(documentNumberSchema, "a".repeat(31))).toBe(
      "validators.document_number.max_length",
    );
  });

  it("rejects an empty and a whitespace-only string after trimming", () => {
    expect(expectFirstIssue(documentNumberSchema, "")).toBe(
      "validators.document_number.min_length",
    );
    expect(expectFirstIssue(documentNumberSchema, "     ")).toBe(
      "validators.document_number.min_length",
    );
  });

  it("rejects non-string values", () => {
    expect(expectFirstIssue(documentNumberSchema, 123)).toBe(
      "validators.document_number.invalid",
    );
    expect(expectFirstIssue(documentNumberSchema, null)).toBe(
      "validators.document_number.invalid",
    );
  });
});

describe("creditLimitSchema", () => {
  it("accepts positive integer and decimal limits", () => {
    expect(expectParsed(creditLimitSchema, 500000)).toBe(500000);
    expect(expectParsed(creditLimitSchema, 0.01)).toBe(0.01);
  });

  it("rejects zero and negative limits", () => {
    expect(expectFirstIssue(creditLimitSchema, 0)).toBe(
      "validators.credit_limit.non_negative",
    );
    expect(expectFirstIssue(creditLimitSchema, -1)).toBe(
      "validators.credit_limit.non_negative",
    );
  });

  it("rejects non-number values", () => {
    expect(expectFirstIssue(creditLimitSchema, "500000")).toBe(
      "validators.credit_limit.invalid",
    );
    expect(expectFirstIssue(creditLimitSchema, null)).toBe(
      "validators.credit_limit.invalid",
    );
  });
});

const VALID_CREATE_CUSTOMER = {
  name: "Cliente Prueba",
  phone: "573001234567",
  email: "cliente@example.com",
  creditLimit: 500000,
  documentType: "CC",
  documentNumber: "1234567890",
};

describe("createCustomerValidator", () => {
  it("accepts a complete valid payload", () => {
    const data = expectParsed(createCustomerValidator, VALID_CREATE_CUSTOMER);
    expect(data.name).toBe("Cliente Prueba");
    expect(data.phone).toBe("573001234567");
    expect(data.email).toBe("cliente@example.com");
    expect(data.creditLimit).toBe(500000);
    expect(data.documentType).toBe("CC");
    expect(data.documentNumber).toBe("1234567890");
  });

  it("trims name, phone and document number", () => {
    const data = expectParsed(createCustomerValidator, {
      name: "  Cliente Prueba  ",
      phone: "  573001234567  ",
      email: "cliente@example.com",
      creditLimit: 500000,
      documentType: "NIT",
      documentNumber: "  1234567890  ",
    });
    expect(data.name).toBe("Cliente Prueba");
    expect(data.phone).toBe("573001234567");
    expect(data.documentNumber).toBe("1234567890");
  });

  it("converts an empty email to null", () => {
    const data = expectParsed(createCustomerValidator, {
      ...VALID_CREATE_CUSTOMER,
      email: "",
    });
    expect(data.email).toBeNull();
  });

  it("accepts a name at its boundaries (5 and 50 characters)", () => {
    expectParsed(createCustomerValidator, {
      ...VALID_CREATE_CUSTOMER,
      name: "a".repeat(5),
    });
    expectParsed(createCustomerValidator, {
      ...VALID_CREATE_CUSTOMER,
      name: "a".repeat(50),
    });
  });

  it("accepts a document number at its boundaries (5 and 30 characters)", () => {
    expectParsed(createCustomerValidator, {
      ...VALID_CREATE_CUSTOMER,
      documentNumber: "a".repeat(5),
    });
    expectParsed(createCustomerValidator, {
      ...VALID_CREATE_CUSTOMER,
      documentNumber: "a".repeat(30),
    });
  });

  it("rejects a name shorter than 5 characters", () => {
    expect(expectFirstIssue(createCustomerValidator, {
      ...VALID_CREATE_CUSTOMER,
      name: "ab",
    })).toBe("validators.name.min_length");
  });

  it("rejects an invalid phone", () => {
    expect(expectFirstIssue(createCustomerValidator, {
      ...VALID_CREATE_CUSTOMER,
      phone: "123",
    })).toBe("validators.phone.min_length");
  });

  it("rejects an invalid email", () => {
    expect(expectFirstIssue(createCustomerValidator, {
      ...VALID_CREATE_CUSTOMER,
      email: "not-an-email",
    })).toBe("validators.email.invalid");
  });

  it("rejects a zero credit limit", () => {
    expect(expectFirstIssue(createCustomerValidator, {
      ...VALID_CREATE_CUSTOMER,
      creditLimit: 0,
    })).toBe("validators.credit_limit.non_negative");
  });

  it("rejects a document type outside the enum", () => {
    expect(expectFirstIssue(createCustomerValidator, {
      ...VALID_CREATE_CUSTOMER,
      documentType: "TI",
    })).toBe("validators.document_type.invalid");
  });

  it("rejects a document number shorter than 5 characters", () => {
    expect(expectFirstIssue(createCustomerValidator, {
      ...VALID_CREATE_CUSTOMER,
      documentNumber: "123",
    })).toBe("validators.document_number.min_length");
  });

  it("rejects a missing name", () => {
    const { name: _name, ...withoutName } = VALID_CREATE_CUSTOMER;
    expect(expectFirstIssue(createCustomerValidator, withoutName)).toBe(
      "validators.name.required",
    );
  });

  it("rejects an empty payload", () => {
    const result = createCustomerValidator.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateCustomerValidator", () => {
  it("accepts a full update payload", () => {
    const data = expectParsed(updateCustomerValidator, {
      id: VALID_UUID,
      name: "Cliente Actualizado",
      phone: "573001234567",
      email: "nuevo@example.com",
      creditLimit: 250000,
      documentType: "NIT",
      documentNumber: "9876543210",
      status: "active",
    });
    expect(data.id).toBe(VALID_UUID);
    expect(data.name).toBe("Cliente Actualizado");
    expect(data.phone).toBe("573001234567");
    expect(data.email).toBe("nuevo@example.com");
    expect(data.creditLimit).toBe(250000);
    expect(data.documentType).toBe("NIT");
    expect(data.documentNumber).toBe("9876543210");
    expect(data.status).toBe("active");
  });

  it("accepts an id-only payload (all other fields optional)", () => {
    expect(expectParsed(updateCustomerValidator, { id: VALID_UUID }).id).toBe(
      VALID_UUID,
    );
  });

  it("converts an empty email to null", () => {
    const data = expectParsed(updateCustomerValidator, {
      id: VALID_UUID,
      email: "",
    });
    expect(data.email).toBeNull();
  });

  it("rejects an invalid name when provided", () => {
    expect(expectFirstIssue(updateCustomerValidator, {
      id: VALID_UUID,
      name: "ab",
    })).toBe("validators.name.min_length");
  });

  it("rejects an invalid email when provided", () => {
    expect(expectFirstIssue(updateCustomerValidator, {
      id: VALID_UUID,
      email: "not-an-email",
    })).toBe("validators.email.invalid");
  });

  it("rejects a zero credit limit when provided", () => {
    expect(expectFirstIssue(updateCustomerValidator, {
      id: VALID_UUID,
      creditLimit: 0,
    })).toBe("validators.credit_limit.non_negative");
  });

  it("rejects a status outside the enum", () => {
    expect(expectFirstIssue(updateCustomerValidator, {
      id: VALID_UUID,
      status: "archived",
    })).toBe("validators.status.invalid");
  });

  it("rejects a missing id", () => {
    expect(expectFirstIssue(updateCustomerValidator, { name: "Nuevo" })).toBe(
      "validators.uuid.invalid",
    );
  });

  it("rejects an invalid id", () => {
    expect(expectFirstIssue(updateCustomerValidator, { id: "not-a-uuid" })).toBe(
      "validators.uuid.invalid",
    );
  });
});