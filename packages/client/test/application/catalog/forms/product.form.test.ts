import { describe, expect, it } from "bun:test";
import { productFormSchema } from "@fludge/client/application/catalog/forms/product.form";

const baseInput = {
  name: "Gaseosa Cola 1.5L",
  barcode: "7791234567890",
  priceRetail: "15.00",
  pricePurchase: "10.00",
  priceWholesale: "8.50",
  categoryId: "",
  sku: "",
};

describe("productFormSchema — stockQuantity refine", () => {
  it("rejects stockQuantity = -1 when allowNegativeStock is false", () => {
    const result = productFormSchema.safeParse({
      ...baseInput,
      stockQuantity: "-1",
      minimumStock: "0",
      allowNegativeStock: false,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const stockIssue = result.error.issues.find(
        (i) => i.path[0] === "stockQuantity",
      );
      expect(stockIssue).toBeDefined();
      expect(stockIssue?.message).toBe(
        "El stock no puede ser negativo si no se permite stock negativo",
      );
    }
  });

  it("allows stockQuantity = -1 when allowNegativeStock is true", () => {
    // minimumStock left empty so the minStock cross-field refine is skipped;
    // this test isolates the negative-stock-allowed behavior only.
    const result = productFormSchema.safeParse({
      ...baseInput,
      stockQuantity: "-1",
      minimumStock: "",
      allowNegativeStock: true,
    });

    expect(result.success).toBe(true);
  });

  it("allows stockQuantity = 0 when allowNegativeStock is false", () => {
    const result = productFormSchema.safeParse({
      ...baseInput,
      stockQuantity: "0",
      minimumStock: "0",
      allowNegativeStock: false,
    });

    expect(result.success).toBe(true);
  });

  it("allows empty stockQuantity (treated as undefined)", () => {
    const result = productFormSchema.safeParse({
      ...baseInput,
      stockQuantity: "",
      minimumStock: "0",
      allowNegativeStock: false,
    });

    expect(result.success).toBe(true);
  });
});

describe("productFormSchema — minimumStock refine", () => {
  it("rejects minimumStock greater than stockQuantity", () => {
    const result = productFormSchema.safeParse({
      ...baseInput,
      stockQuantity: "2",
      minimumStock: "8",
      allowNegativeStock: false,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const minIssue = result.error.issues.find(
        (i) => i.path[0] === "minimumStock",
      );
      expect(minIssue).toBeDefined();
      expect(minIssue?.message).toBe(
        "El stock mínimo no puede ser mayor al stock actual",
      );
    }
  });

  it("accepts minimumStock less than or equal to stockQuantity", () => {
    const result = productFormSchema.safeParse({
      ...baseInput,
      stockQuantity: "10",
      minimumStock: "5",
      allowNegativeStock: false,
    });

    expect(result.success).toBe(true);
  });

  it("skips minimumStock refine when only minimumStock is supplied", () => {
    const result = productFormSchema.safeParse({
      ...baseInput,
      stockQuantity: "",
      minimumStock: "10",
      allowNegativeStock: false,
    });

    expect(result.success).toBe(true);
  });
});
