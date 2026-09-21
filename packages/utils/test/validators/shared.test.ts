import { describe, expect, it } from "bun:test";

import {
  getI18nKey,
  uuidSchema,
  nameSchema,
  descriptionSchema,
  statusSchema,
  phoneSchema,
  emailSchema,
  passwordSchema,
  notesSchema,
} from "@fludge/utils/validators/shared";

const VALID_UUID = "00000000-0000-4000-8000-000000000001";

// ---------------------------------------------------------------------------
// getI18nKey
// ---------------------------------------------------------------------------

describe("getI18nKey", () => {
  it("returns the key as-is", () => {
    expect(getI18nKey("validators.uuid.invalid" as never)).toBe(
      "validators.uuid.invalid",
    );
  });
});

// ---------------------------------------------------------------------------
// uuidSchema
// ---------------------------------------------------------------------------

describe("uuidSchema", () => {
  it("accepts a valid uuid", () => {
    expect(uuidSchema.parse(VALID_UUID)).toBe(VALID_UUID);
  });

  it("rejects an invalid uuid", () => {
    expect(() => uuidSchema.parse("not-a-uuid")).toThrow();
  });

  it("rejects an empty string", () => {
    expect(() => uuidSchema.parse("")).toThrow();
  });
});

// ---------------------------------------------------------------------------
// nameSchema
// ---------------------------------------------------------------------------

describe("nameSchema", () => {
  it("accepts a valid name", () => {
    expect(nameSchema.parse("Fludge Corp")).toBe("Fludge Corp");
  });

  it("trims whitespace", () => {
    expect(nameSchema.parse("  Fludge Corp  ")).toBe("Fludge Corp");
  });

  it("rejects names shorter than 5 chars", () => {
    expect(() => nameSchema.parse("Abc")).toThrow();
  });

  it("rejects names longer than 50 chars", () => {
    expect(() => nameSchema.parse("A".repeat(51))).toThrow();
  });

  it("rejects empty names", () => {
    expect(() => nameSchema.parse("")).toThrow();
  });
});

// ---------------------------------------------------------------------------
// descriptionSchema
// ---------------------------------------------------------------------------

describe("descriptionSchema", () => {
  it("accepts an empty string", () => {
    expect(descriptionSchema.parse("")).toBe("");
  });

  it("accepts a valid description", () => {
    expect(descriptionSchema.parse("Descripción de prueba")).toBe(
      "Descripción de prueba",
    );
  });

  it("rejects descriptions shorter than 15 chars", () => {
    expect(() => descriptionSchema.parse("Corto")).toThrow();
  });

  it("rejects descriptions longer than 100 chars", () => {
    expect(() => descriptionSchema.parse("A".repeat(101))).toThrow();
  });
});

// ---------------------------------------------------------------------------
// statusSchema
// ---------------------------------------------------------------------------

describe("statusSchema", () => {
  it("accepts active and inactive", () => {
    expect(statusSchema.parse("active")).toBe("active");
    expect(statusSchema.parse("inactive")).toBe("inactive");
  });

  it("rejects unknown statuses", () => {
    expect(() => statusSchema.parse("discontinued")).toThrow();
    expect(() => statusSchema.parse("")).toThrow();
  });
});

// ---------------------------------------------------------------------------
// phoneSchema
// ---------------------------------------------------------------------------

describe("phoneSchema", () => {
  it("accepts a valid phone without the + prefix", () => {
    expect(phoneSchema.parse("573001234567")).toBe("573001234567");
    expect(phoneSchema.parse("3001234567")).toBe("3001234567");
  });

  it("rejects phones with non-numeric characters", () => {
    expect(() => phoneSchema.parse("57 300-ABC")).toThrow();
  });

  it("rejects phones with the + prefix", () => {
    // El refine convierte a Number y compara length: "+57..." pierde el "+"
    // al pasar por Number().toString(), por lo que el schema lo rechaza.
    expect(() => phoneSchema.parse("+573001234567")).toThrow();
  });

  it("rejects phones shorter than 9 chars", () => {
    expect(() => phoneSchema.parse("12345678")).toThrow();
  });

  it("rejects phones longer than 15 chars", () => {
    expect(() => phoneSchema.parse("1234567890123456")).toThrow();
  });

  it("rejects empty phones", () => {
    expect(() => phoneSchema.parse("")).toThrow();
  });
});

// ---------------------------------------------------------------------------
// emailSchema
// ---------------------------------------------------------------------------

describe("emailSchema", () => {
  it("accepts a valid email", () => {
    expect(emailSchema.parse("user@example.com")).toBe("user@example.com");
  });

  it("rejects an invalid email", () => {
    expect(() => emailSchema.parse("not-an-email")).toThrow();
  });

  it("rejects an empty email", () => {
    expect(() => emailSchema.parse("")).toThrow();
  });
});

// ---------------------------------------------------------------------------
// passwordSchema
// ---------------------------------------------------------------------------

describe("passwordSchema", () => {
  it("accepts a valid password", () => {
    expect(passwordSchema.parse("password123")).toBe("password123");
  });

  it("rejects passwords shorter than 8 chars", () => {
    expect(() => passwordSchema.parse("short")).toThrow();
  });

  it("rejects passwords longer than 50 chars", () => {
    expect(() => passwordSchema.parse("A".repeat(51))).toThrow();
  });

  it("trims whitespace", () => {
    expect(passwordSchema.parse("  password123  ")).toBe("password123");
  });
});

// ---------------------------------------------------------------------------
// notesSchema
// ---------------------------------------------------------------------------

describe("notesSchema", () => {
  it("accepts an empty string", () => {
    expect(notesSchema.parse("")).toBe("");
  });

  it("accepts a valid note", () => {
    expect(notesSchema.parse("Nota de prueba para venta")).toBe(
      "Nota de prueba para venta",
    );
  });

  it("rejects notes shorter than 15 chars", () => {
    expect(() => notesSchema.parse("Corta")).toThrow();
  });

  it("rejects notes longer than 100 chars", () => {
    expect(() => notesSchema.parse("A".repeat(101))).toThrow();
  });
});