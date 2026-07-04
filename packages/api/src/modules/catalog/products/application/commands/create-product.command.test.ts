import { describe, expect, it } from "bun:test";
import { createProductCommand } from "@fludge/api/modules/catalog/products/application/commands/create-product.command";

const baseInput = {
  name: "Gaseosa Cola 1.5L",
  barcode: "7791234567890",
  priceRetail: "15.00",
  pricePurchase: "10.00",
  priceWholesale: "8.50",
};

describe("createProductCommand schema — stockQuantity refine", () => {
  it("rejects stockQuantity = -1 when allowNegativeStock is false", () => {
    const result = createProductCommand.safeParse({
      ...baseInput,
      stockQuantity: -1,
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
    const result = createProductCommand.safeParse({
      ...baseInput,
      stockQuantity: -1,
      allowNegativeStock: true,
    });

    expect(result.success).toBe(true);
  });

  it("allows stockQuantity = 0 when allowNegativeStock is false", () => {
    const result = createProductCommand.safeParse({
      ...baseInput,
      stockQuantity: 0,
      allowNegativeStock: false,
    });

    expect(result.success).toBe(true);
  });

  it("allows stockQuantity to be omitted", () => {
    const result = createProductCommand.safeParse({
      ...baseInput,
    });

    expect(result.success).toBe(true);
  });
});
