import { describe, expect, it } from "bun:test";
import type { ZodType } from "zod";

import {
  createCategoryValidator,
  deleteCategoryValidator,
  updateCategoryValidator,
} from "../../src/validators/category.validators";

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

const VALID_CREATE_CATEGORY = {
  name: "Electrónica",
  description: "",
};

describe("createCategoryValidator", () => {
  it("accepts a valid category with an empty description", () => {
    const data = expectParsed(createCategoryValidator, VALID_CREATE_CATEGORY);
    expect(data.name).toBe("Electrónica");
    expect(data.description).toBe("");
  });

  it("accepts a valid category with a real description", () => {
    const data = expectParsed(createCategoryValidator, {
      name: "Electrónica",
      description: "Productos electrónicos",
    });
    expect(data.description).toBe("Productos electrónicos");
  });

  it("trims the name", () => {
    expect(
      expectParsed(createCategoryValidator, {
        name: "  Electrónica  ",
        description: "",
      }).name,
    ).toBe("Electrónica");
  });

  it("rejects a name shorter than 5 characters", () => {
    expect(expectFirstIssue(createCategoryValidator, {
      name: "a",
      description: "",
    })).toBe("validators.name.min_length");
  });

  it("rejects a name longer than 50 characters", () => {
    expect(expectFirstIssue(createCategoryValidator, {
      name: "a".repeat(51),
      description: "",
    })).toBe("validators.name.max_length");
  });

  it("rejects a missing description", () => {
    expect(expectFirstIssue(createCategoryValidator, { name: "Electrónica" })).toBe(
      "Invalid input",
    );
  });

  it("rejects a description shorter than 15 characters", () => {
    expect(expectFirstIssue(createCategoryValidator, {
      name: "Electrónica",
      description: "x",
    })).toBe("validators.description.min_length");
  });

  it("rejects a description longer than 100 characters", () => {
    expect(expectFirstIssue(createCategoryValidator, {
      name: "Electrónica",
      description: "a".repeat(101),
    })).toBe("validators.description.max_length");
  });

  it("rejects a non-string description", () => {
    expect(expectFirstIssue(createCategoryValidator, {
      name: "Electrónica",
      description: 5,
    })).toBe("Invalid input");
  });
});

describe("deleteCategoryValidator", () => {
  it("accepts a valid category id", () => {
    expect(expectParsed(deleteCategoryValidator, { id: VALID_UUID }).id).toBe(
      VALID_UUID,
    );
  });

  it("rejects an invalid category id", () => {
    expect(expectFirstIssue(deleteCategoryValidator, { id: "not-a-uuid" })).toBe(
      "validators.uuid.invalid",
    );
  });

  it("rejects a missing id", () => {
    expect(expectFirstIssue(deleteCategoryValidator, {})).toBe(
      "validators.uuid.invalid",
    );
  });
});

describe("updateCategoryValidator", () => {
  it("accepts a minimal payload with only the id", () => {
    expect(expectParsed(updateCategoryValidator, { id: VALID_UUID }).id).toBe(
      VALID_UUID,
    );
  });

  it("accepts an id with a new name", () => {
    const data = expectParsed(updateCategoryValidator, {
      id: VALID_UUID,
      name: "Nuevo Nombre",
    });
    expect(data.name).toBe("Nuevo Nombre");
  });

  it("accepts an id with a description update", () => {
    expectParsed(updateCategoryValidator, {
      id: VALID_UUID,
      description: "Descripción actualizada",
    });
  });

  it("accepts an id with a status update", () => {
    expectParsed(updateCategoryValidator, { id: VALID_UUID, status: "active" });
    expectParsed(updateCategoryValidator, { id: VALID_UUID, status: "inactive" });
  });

  it("rejects a status outside the enum", () => {
    expect(expectFirstIssue(updateCategoryValidator, {
      id: VALID_UUID,
      status: "archived",
    })).toMatch(/Invalid option/);
  });

  it("rejects an invalid name when provided", () => {
    expect(expectFirstIssue(updateCategoryValidator, {
      id: VALID_UUID,
      name: "ab",
    })).toBe("validators.name.min_length");
  });

  it("rejects an invalid description when provided", () => {
    expect(expectFirstIssue(updateCategoryValidator, {
      id: VALID_UUID,
      description: "x",
    })).toBe("validators.description.min_length");
  });

  it("rejects a missing id", () => {
    expect(expectFirstIssue(updateCategoryValidator, {
      name: "Nuevo Nombre",
    })).toBe("validators.uuid.invalid");
  });

  it("strips unknown keys", () => {
    const data = expectParsed(updateCategoryValidator, {
      id: VALID_UUID,
      extra: "ignored",
    });
    expect("extra" in data).toBe(false);
  });
});