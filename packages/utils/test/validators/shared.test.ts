import { describe, expect, it } from "bun:test";
import type { ZodType } from "zod";

import {
  descriptionSchema,
  emailSchema,
  getI18nKey,
  nameSchema,
  notesSchema,
  passwordSchema,
  phoneSchema,
  statusSchema,
  uuidSchema,
} from "../../src/validators/shared";

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

describe("getI18nKey", () => {
  it("returns the key unchanged", () => {
    expect(getI18nKey("validators.uuid.invalid")).toBe(
      "validators.uuid.invalid",
    );
  });
});

describe("uuidSchema", () => {
  it("accepts a valid uuid", () => {
    expect(expectParsed(uuidSchema, VALID_UUID)).toBe(VALID_UUID);
  });

  it("accepts uppercase hex digits", () => {
    expect(expectParsed(uuidSchema, "00000000-0000-4000-8000-00000000000F")).toBe(
      "00000000-0000-4000-8000-00000000000F",
    );
  });

  it("rejects a malformed uuid", () => {
    expect(expectFirstIssue(uuidSchema, "not-a-uuid")).toBe(
      "validators.uuid.invalid",
    );
  });

  it("rejects an empty string", () => {
    expect(expectFirstIssue(uuidSchema, "")).toBe("validators.uuid.invalid");
  });

  it("rejects null and undefined", () => {
    expect(expectFirstIssue(uuidSchema, null)).toBe("validators.uuid.invalid");
    expect(expectFirstIssue(uuidSchema, undefined)).toBe(
      "validators.uuid.invalid",
    );
  });

  it("rejects non-string values", () => {
    expect(expectFirstIssue(uuidSchema, 123)).toBe("validators.uuid.invalid");
  });
});

describe("nameSchema", () => {
  it("accepts a name at the minimum length (5)", () => {
    expect(expectParsed(nameSchema, "a".repeat(5))).toBe("a".repeat(5));
  });

  it("accepts a name at the maximum length (50)", () => {
    expect(expectParsed(nameSchema, "a".repeat(50))).toBe("a".repeat(50));
  });

  it("rejects a name shorter than 5 characters", () => {
    expect(expectFirstIssue(nameSchema, "a".repeat(4))).toBe(
      "validators.name.min_length",
    );
  });

  it("rejects a name longer than 50 characters", () => {
    expect(expectFirstIssue(nameSchema, "a".repeat(51))).toBe(
      "validators.name.max_length",
    );
  });

  it("rejects an empty string", () => {
    expect(expectFirstIssue(nameSchema, "")).toBe("validators.name.min_length");
  });

  it("rejects a whitespace-only string after trimming", () => {
    expect(expectFirstIssue(nameSchema, "     ")).toBe(
      "validators.name.min_length",
    );
  });

  it("trims surrounding whitespace before validating", () => {
    expect(expectParsed(nameSchema, "   abcde   ")).toBe("abcde");
  });

  it("rejects non-string values", () => {
    expect(expectFirstIssue(nameSchema, 42)).toBe("validators.name.required");
    expect(expectFirstIssue(nameSchema, undefined)).toBe(
      "validators.name.required",
    );
  });
});

describe("descriptionSchema", () => {
  it("accepts an empty string as 'no description'", () => {
    expect(expectParsed(descriptionSchema, "")).toBe("");
  });

  it("accepts a description at the minimum length (15)", () => {
    expect(expectParsed(descriptionSchema, "a".repeat(15))).toBe("a".repeat(15));
  });

  it("accepts a description at the maximum length (100)", () => {
    expect(expectParsed(descriptionSchema, "a".repeat(100))).toBe(
      "a".repeat(100),
    );
  });

  it("rejects a description shorter than 15 characters", () => {
    expect(expectFirstIssue(descriptionSchema, "a".repeat(14))).toBe(
      "validators.description.min_length",
    );
  });

  it("rejects a description longer than 100 characters", () => {
    expect(expectFirstIssue(descriptionSchema, "a".repeat(101))).toBe(
      "validators.description.max_length",
    );
  });

  it("rejects a whitespace-only string (literal \"\" does not match)", () => {
    expect(expectFirstIssue(descriptionSchema, "  ")).toBe(
      "validators.description.min_length",
    );
  });

  it("rejects null, undefined and non-string values", () => {
    expect(expectFirstIssue(descriptionSchema, null)).toBe("Invalid input");
    expect(expectFirstIssue(descriptionSchema, undefined)).toBe(
      "Invalid input",
    );
    expect(expectFirstIssue(descriptionSchema, 5)).toBe("Invalid input");
  });
});

describe("statusSchema", () => {
  it("accepts every enum value", () => {
    for (const status of ["active", "inactive"] as const) {
      expect(expectParsed(statusSchema, status)).toBe(status);
    }
  });

  it("rejects values outside the enum", () => {
    expect(expectFirstIssue(statusSchema, "archived")).toBe(
      "validators.status.invalid",
    );
  });

  it("rejects an empty string and case mismatches", () => {
    expect(expectFirstIssue(statusSchema, "")).toBe("validators.status.invalid");
    expect(expectFirstIssue(statusSchema, "ACTIVE")).toBe(
      "validators.status.invalid",
    );
  });

  it("rejects null and undefined", () => {
    expect(expectFirstIssue(statusSchema, null)).toBe(
      "validators.status.invalid",
    );
    expect(expectFirstIssue(statusSchema, undefined)).toBe(
      "validators.status.invalid",
    );
  });
});

describe("phoneSchema", () => {
  it("accepts a numeric string at the minimum length (9)", () => {
    expect(expectParsed(phoneSchema, "123456789")).toBe("123456789");
  });

  it("accepts a numeric string at the maximum length (15)", () => {
    expect(expectParsed(phoneSchema, "123456789012345")).toBe(
      "123456789012345",
    );
  });

  it("trims surrounding whitespace", () => {
    expect(expectParsed(phoneSchema, "  123456789  ")).toBe("123456789");
  });

  it("rejects a string shorter than 9 characters", () => {
    expect(expectFirstIssue(phoneSchema, "12345678")).toBe(
      "validators.phone.min_length",
    );
  });

  it("rejects a string longer than 15 characters", () => {
    expect(expectFirstIssue(phoneSchema, "1234567890123456")).toBe(
      "validators.phone.max_length",
    );
  });

  it("rejects non-numeric content", () => {
    expect(expectFirstIssue(phoneSchema, "abcdefghijk")).toBe(
      "validators.phone.invalid",
    );
  });

  it("rejects values that do not round-trip through Number()", () => {
    // leading zero is lost by Number(): "03001234567" -> 3001234567
    expect(expectFirstIssue(phoneSchema, "03001234567")).toBe(
      "validators.phone.invalid",
    );
    // plus sign is stripped by Number()
    expect(expectFirstIssue(phoneSchema, "+5730012345")).toBe(
      "validators.phone.invalid",
    );
    // inner whitespace makes Number() return NaN
    expect(expectFirstIssue(phoneSchema, "57300 12345")).toBe(
      "validators.phone.invalid",
    );
  });

  it("accepts a decimal string when Number() round-trips (schema as-is)", () => {
    expect(expectParsed(phoneSchema, "57300.1234")).toBe("57300.1234");
  });

  it("rejects non-string values", () => {
    expect(expectFirstIssue(phoneSchema, 123456789)).toBe(
      "validators.phone.invalid",
    );
    expect(expectFirstIssue(phoneSchema, undefined)).toBe(
      "validators.phone.invalid",
    );
  });
});

describe("emailSchema", () => {
  it("accepts a standard email", () => {
    expect(expectParsed(emailSchema, "juan@example.com")).toBe(
      "juan@example.com",
    );
  });

  it("accepts emails with a plus tag and short TLD", () => {
    expect(expectParsed(emailSchema, "user+tag@example.co")).toBe(
      "user+tag@example.co",
    );
  });

  it("rejects a string without a TLD", () => {
    expect(expectFirstIssue(emailSchema, "user@example")).toBe(
      "validators.email.invalid",
    );
  });

  it("rejects malformed emails", () => {
    expect(expectFirstIssue(emailSchema, "not-an-email")).toBe(
      "validators.email.invalid",
    );
    expect(expectFirstIssue(emailSchema, "user@example..com")).toBe(
      "validators.email.invalid",
    );
  });

  it("does not trim surrounding whitespace", () => {
    expect(expectFirstIssue(emailSchema, " user@example.com")).toBe(
      "validators.email.invalid",
    );
  });

  it("rejects an empty string, null and undefined", () => {
    expect(expectFirstIssue(emailSchema, "")).toBe("validators.email.invalid");
    expect(expectFirstIssue(emailSchema, null)).toBe("validators.email.invalid");
    expect(expectFirstIssue(emailSchema, undefined)).toBe(
      "validators.email.invalid",
    );
  });
});

describe("passwordSchema", () => {
  it("accepts a password at the minimum length (8)", () => {
    expect(expectParsed(passwordSchema, "a".repeat(8))).toBe("a".repeat(8));
  });

  it("accepts a password at the maximum length (50)", () => {
    expect(expectParsed(passwordSchema, "a".repeat(50))).toBe("a".repeat(50));
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(expectFirstIssue(passwordSchema, "a".repeat(7))).toBe(
      "validators.password.min_length",
    );
  });

  it("rejects a password longer than 50 characters", () => {
    expect(expectFirstIssue(passwordSchema, "a".repeat(51))).toBe(
      "validators.password.max_length",
    );
  });

  it("trims surrounding whitespace", () => {
    expect(expectParsed(passwordSchema, "  abcdefgh  ")).toBe("abcdefgh");
  });

  it("rejects non-string values", () => {
    expect(expectFirstIssue(passwordSchema, undefined)).toBe(
      "validators.password.invalid",
    );
    expect(expectFirstIssue(passwordSchema, 12345678)).toBe(
      "validators.password.invalid",
    );
  });
});

describe("notesSchema", () => {
  it("accepts an empty string as 'no notes'", () => {
    expect(expectParsed(notesSchema, "")).toBe("");
  });

  it("accepts notes at the minimum length (15)", () => {
    expect(expectParsed(notesSchema, "a".repeat(15))).toBe("a".repeat(15));
  });

  it("accepts notes at the maximum length (100)", () => {
    expect(expectParsed(notesSchema, "a".repeat(100))).toBe("a".repeat(100));
  });

  it("rejects notes shorter than 15 characters", () => {
    expect(expectFirstIssue(notesSchema, "a".repeat(14))).toBe(
      "validators.notes.min_length",
    );
  });

  it("rejects notes longer than 100 characters", () => {
    expect(expectFirstIssue(notesSchema, "a".repeat(101))).toBe(
      "validators.notes.max_length",
    );
  });

  it("rejects null, undefined and non-string values", () => {
    expect(expectFirstIssue(notesSchema, null)).toBe("Invalid input");
    expect(expectFirstIssue(notesSchema, undefined)).toBe("Invalid input");
  });
});