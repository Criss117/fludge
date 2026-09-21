import { describe, expect, it } from "bun:test";

import {
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} from "@fludge/utils/validators/category.validators";

const VALID_UUID = "00000000-0000-4000-8000-000000000001";

function validCreateCategory(overrides?: Partial<ReturnType<typeof createCategoryValidator.parse>>) {
  return {
    name: "Bebidas y refrescos",
    description: "Categoría para bebidas",
    ...overrides,
  };
}

describe("createCategoryValidator", () => {
  it("accepts a valid category", () => {
    expect(createCategoryValidator.parse(validCreateCategory())).toEqual(
      validCreateCategory(),
    );
  });

  it("rejects a short name", () => {
    expect(() =>
      createCategoryValidator.parse(validCreateCategory({ name: "ABC" })),
    ).toThrow();
  });

  it("rejects a short description", () => {
    expect(() =>
      createCategoryValidator.parse(
        validCreateCategory({ description: "Corta" }),
      ),
    ).toThrow();
  });
});

describe("updateCategoryValidator", () => {
  it("accepts a partial update with id", () => {
    const result = updateCategoryValidator.parse({ id: VALID_UUID, name: "Nuevo" });

    expect(result.name).toBe("Nuevo");
  });

  it("rejects a missing id", () => {
    expect(() => updateCategoryValidator.parse({ name: "Nuevo" })).toThrow();
  });

  it("accepts a status update", () => {
    const result = updateCategoryValidator.parse({
      id: VALID_UUID,
      status: "inactive",
    });

    expect(result.status).toBe("inactive");
  });
});

describe("deleteCategoryValidator", () => {
  it("accepts a valid id", () => {
    expect(deleteCategoryValidator.parse({ id: VALID_UUID })).toEqual({
      id: VALID_UUID,
    });
  });

  it("rejects an invalid id", () => {
    expect(() => deleteCategoryValidator.parse({ id: "nope" })).toThrow();
  });
});