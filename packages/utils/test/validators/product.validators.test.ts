import { describe, expect, it } from "bun:test";
import type { ZodType } from "zod";

import {
  barcodeSchema,
  categoryIdSchema,
  conversionFactorSchema,
  createProductPresentationValidator,
  createProductValidator,
  deleteProductValidator,
  minStockSchema,
  pricePurchaseSchema,
  priceSaleSchema,
  priceWholesaleSchema,
  productStatusSchema,
  stockSchema,
  updateProductPresentationValidator,
  updateProductValidator,
} from "../../src/validators/product.validators";

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

describe("barcodeSchema", () => {
  it("accepts a barcode at the minimum length (6)", () => {
    expect(expectParsed(barcodeSchema, "a".repeat(6))).toBe("a".repeat(6));
  });

  it("accepts a barcode at the maximum length (100)", () => {
    expect(expectParsed(barcodeSchema, "a".repeat(100))).toBe("a".repeat(100));
  });

  it("converts an empty string to undefined", () => {
    expect(expectParsed(barcodeSchema, "")).toBeUndefined();
  });

  it("preserves surrounding whitespace (no trim)", () => {
    expect(expectParsed(barcodeSchema, "  123456  ")).toBe("  123456  ");
  });

  it("rejects a barcode shorter than 6 characters", () => {
    expect(expectFirstIssue(barcodeSchema, "a".repeat(5))).toBe(
      "validators.barcode.min_length",
    );
  });

  it("rejects a barcode longer than 100 characters", () => {
    expect(expectFirstIssue(barcodeSchema, "a".repeat(101))).toBe(
      "validators.barcode.max_length",
    );
  });

  it("rejects a whitespace-only string (literal \"\" does not match)", () => {
    expect(expectFirstIssue(barcodeSchema, "     ")).toBe(
      "validators.barcode.min_length",
    );
  });

  it("rejects non-string values", () => {
    // the literal "" branch turns the top-level failure into a union error
    expect(expectFirstIssue(barcodeSchema, 123)).toBe("Invalid input");
    expect(expectFirstIssue(barcodeSchema, null)).toBe("Invalid input");
    expect(expectFirstIssue(barcodeSchema, undefined)).toBe("Invalid input");
  });
});

describe("categoryIdSchema", () => {
  it("accepts a valid uuid", () => {
    expect(expectParsed(categoryIdSchema, VALID_UUID)).toBe(VALID_UUID);
  });

  it("converts an empty string to undefined", () => {
    expect(expectParsed(categoryIdSchema, "")).toBeUndefined();
  });

  it("rejects a malformed uuid", () => {
    expect(expectFirstIssue(categoryIdSchema, "not-a-uuid")).toBe(
      "validators.uuid.invalid",
    );
  });
});

describe("conversionFactorSchema", () => {
  it("accepts a positive integer", () => {
    expect(expectParsed(conversionFactorSchema, 2)).toBe(2);
  });

  it("coerces a numeric string", () => {
    expect(expectParsed(conversionFactorSchema, "2")).toBe(2);
  });

  it("rejects zero and negative values", () => {
    expect(expectFirstIssue(conversionFactorSchema, 0)).toBe(
      "validators.conversion_factor.positive",
    );
    expect(expectFirstIssue(conversionFactorSchema, -1)).toBe(
      "validators.conversion_factor.positive",
    );
  });

  it("rejects a non-integer value", () => {
    expect(expectFirstIssue(conversionFactorSchema, 1.5)).toBe(
      "validators.conversion_factor.integer",
    );
  });

  it("rejects a non-numeric string", () => {
    expect(expectFirstIssue(conversionFactorSchema, "abc")).toBe(
      "validators.conversion_factor.invalid",
    );
  });
});

describe("priceSaleSchema", () => {
  it("accepts a positive integer price", () => {
    expect(expectParsed(priceSaleSchema, 5000)).toBe(5000);
  });

  it("coerces a numeric string", () => {
    expect(expectParsed(priceSaleSchema, "5000")).toBe(5000);
  });

  it("rejects zero and negative prices", () => {
    expect(expectFirstIssue(priceSaleSchema, 0)).toBe(
      "validators.price_sale.positive",
    );
    expect(expectFirstIssue(priceSaleSchema, -1)).toBe(
      "validators.price_sale.positive",
    );
  });

  it("rejects a non-integer price", () => {
    expect(expectFirstIssue(priceSaleSchema, 2.5)).toBe(
      "validators.price_sale.integer",
    );
  });

  it("rejects a non-numeric string", () => {
    expect(expectFirstIssue(priceSaleSchema, "abc")).toBe(
      "validators.price_sale.invalid",
    );
  });
});

describe("pricePurchaseSchema", () => {
  it("accepts a positive integer purchase price", () => {
    expect(expectParsed(pricePurchaseSchema, 3000)).toBe(3000);
  });

  it("converts the literal zero to undefined", () => {
    expect(expectParsed(pricePurchaseSchema, 0)).toBeUndefined();
  });

  it("coerces a positive numeric string", () => {
    expect(expectParsed(pricePurchaseSchema, "3000")).toBe(3000);
  });

  it("rejects the string \"0\" (literal zero does not coerce)", () => {
    expect(expectFirstIssue(pricePurchaseSchema, "0")).toBe(
      "validators.price_purchase.positive",
    );
  });

  it("rejects negative values", () => {
    expect(expectFirstIssue(pricePurchaseSchema, -1)).toBe(
      "validators.price_purchase.positive",
    );
  });

  it("rejects a non-integer value", () => {
    expect(expectFirstIssue(pricePurchaseSchema, 2.5)).toBe("Invalid input");
  });

  it("rejects a non-numeric string", () => {
    expect(expectFirstIssue(pricePurchaseSchema, "abc")).toBe("Invalid input");
  });
});

describe("priceWholesaleSchema", () => {
  it("accepts a positive integer wholesale price", () => {
    expect(expectParsed(priceWholesaleSchema, 2500)).toBe(2500);
  });

  it("converts the literal zero to undefined", () => {
    expect(expectParsed(priceWholesaleSchema, 0)).toBeUndefined();
  });

  it("coerces a positive numeric string", () => {
    expect(expectParsed(priceWholesaleSchema, "2500")).toBe(2500);
  });

  it("rejects the string \"0\" (literal zero does not coerce)", () => {
    expect(expectFirstIssue(priceWholesaleSchema, "0")).toBe(
      "validators.price_wholesale.positive",
    );
  });

  it("rejects negative values", () => {
    expect(expectFirstIssue(priceWholesaleSchema, -1)).toBe(
      "validators.price_wholesale.positive",
    );
  });

  it("rejects a non-integer value", () => {
    expect(expectFirstIssue(priceWholesaleSchema, 1.5)).toBe("Invalid input");
  });

  it("rejects a non-numeric string", () => {
    expect(expectFirstIssue(priceWholesaleSchema, "abc")).toBe("Invalid input");
  });
});

describe("productStatusSchema", () => {
  it("accepts every product status", () => {
    for (const status of ["active", "inactive", "discontinued"] as const) {
      expect(expectParsed(productStatusSchema, status)).toBe(status);
    }
  });

  it("rejects values outside the enum", () => {
    expect(expectFirstIssue(productStatusSchema, "archived")).toBe(
      "validators.product_status.invalid",
    );
    expect(expectFirstIssue(productStatusSchema, "ACTIVE")).toBe(
      "validators.product_status.invalid",
    );
  });

  it("rejects null and undefined", () => {
    expect(expectFirstIssue(productStatusSchema, null)).toBe(
      "validators.product_status.invalid",
    );
    expect(expectFirstIssue(productStatusSchema, undefined)).toBe(
      "validators.product_status.invalid",
    );
  });
});

describe("stockSchema", () => {
  it("accepts a positive integer stock", () => {
    expect(expectParsed(stockSchema, 10)).toBe(10);
  });

  it("coerces a numeric string", () => {
    expect(expectParsed(stockSchema, "10")).toBe(10);
  });

  it("rejects zero and negative stock", () => {
    expect(expectFirstIssue(stockSchema, 0)).toBe(
      "validators.stock.positive",
    );
    expect(expectFirstIssue(stockSchema, -3)).toBe(
      "validators.stock.positive",
    );
  });

  it("rejects a non-integer stock", () => {
    expect(expectFirstIssue(stockSchema, 2.5)).toBe(
      "validators.stock.integer",
    );
  });

  it("rejects a non-numeric string", () => {
    expect(expectFirstIssue(stockSchema, "abc")).toBe(
      "validators.stock.invalid",
    );
  });
});

describe("minStockSchema", () => {
  it("accepts a positive integer minimum stock", () => {
    expect(expectParsed(minStockSchema, 1)).toBe(1);
  });

  it("coerces a numeric string", () => {
    expect(expectParsed(minStockSchema, "5")).toBe(5);
  });

  it("rejects zero and negative minimum stock", () => {
    expect(expectFirstIssue(minStockSchema, 0)).toBe(
      "validators.min_stock.positive",
    );
    expect(expectFirstIssue(minStockSchema, -1)).toBe(
      "validators.min_stock.positive",
    );
  });

  it("rejects a non-integer minimum stock", () => {
    expect(expectFirstIssue(minStockSchema, 1.5)).toBe(
      "validators.min_stock.integer",
    );
  });

  it("rejects a non-numeric string", () => {
    expect(expectFirstIssue(minStockSchema, "abc")).toBe(
      "validators.min_stock.invalid",
    );
  });
});

const VALID_PRESENTATION = {
  name: "Presentación 500g",
  barcode: "7701234567890",
  conversionFactor: 1,
  priceSale: 5000,
  pricePurchase: 3000,
  priceWholesale: 2500,
};

describe("createProductPresentationValidator", () => {
  it("accepts a complete valid presentation", () => {
    const data = expectParsed(
      createProductPresentationValidator,
      VALID_PRESENTATION,
    );
    expect(data.name).toBe("Presentación 500g");
    expect(data.barcode).toBe("7701234567890");
    expect(data.conversionFactor).toBe(1);
    expect(data.priceSale).toBe(5000);
    expect(data.pricePurchase).toBe(3000);
    expect(data.priceWholesale).toBe(2500);
  });

  it("accepts an empty barcode and a zero purchase price", () => {
    const data = expectParsed(createProductPresentationValidator, {
      ...VALID_PRESENTATION,
      barcode: "",
      pricePurchase: 0,
      priceWholesale: 0,
    });
    expect(data.barcode).toBeUndefined();
    expect(data.pricePurchase).toBeUndefined();
    expect(data.priceWholesale).toBeUndefined();
  });

  it("trims the name", () => {
    expect(
      expectParsed(createProductPresentationValidator, {
        ...VALID_PRESENTATION,
        name: "  Presentación 500g  ",
      }).name,
    ).toBe("Presentación 500g");
  });

  it("rejects a name shorter than 5 characters", () => {
    expect(expectFirstIssue(createProductPresentationValidator, {
      ...VALID_PRESENTATION,
      name: "ab",
    })).toBe("validators.name.min_length");
  });

  it("rejects a missing name", () => {
    const { name: _name, ...withoutName } = VALID_PRESENTATION;
    expect(expectFirstIssue(createProductPresentationValidator, withoutName)).toBe(
      "validators.name.required",
    );
  });

  it("rejects a barcode shorter than 6 characters", () => {
    expect(expectFirstIssue(createProductPresentationValidator, {
      ...VALID_PRESENTATION,
      barcode: "12345",
    })).toBe("validators.barcode.min_length");
  });

  it("rejects a zero conversion factor", () => {
    expect(expectFirstIssue(createProductPresentationValidator, {
      ...VALID_PRESENTATION,
      conversionFactor: 0,
    })).toBe("validators.conversion_factor.positive");
  });

  it("rejects a zero sale price", () => {
    expect(expectFirstIssue(createProductPresentationValidator, {
      ...VALID_PRESENTATION,
      priceSale: 0,
    })).toBe("validators.price_sale.positive");
  });

  it("rejects a negative purchase price", () => {
    expect(expectFirstIssue(createProductPresentationValidator, {
      ...VALID_PRESENTATION,
      pricePurchase: -1,
    })).toBe("validators.price_purchase.positive");
  });

  it("rejects a negative wholesale price", () => {
    expect(expectFirstIssue(createProductPresentationValidator, {
      ...VALID_PRESENTATION,
      priceWholesale: -1,
    })).toBe("validators.price_wholesale.positive");
  });
});

describe("updateProductPresentationValidator", () => {
  it("accepts a presentation with an id and a status", () => {
    const data = expectParsed(updateProductPresentationValidator, {
      ...VALID_PRESENTATION,
      id: VALID_UUID,
      status: "active",
    });
    expect(data.id).toBe(VALID_UUID);
    expect(data.status).toBe("active");
  });

  it("rejects a missing id", () => {
    expect(expectFirstIssue(updateProductPresentationValidator, {
      ...VALID_PRESENTATION,
      status: "active",
    })).toBe("validators.uuid.invalid");
  });

  it("rejects a status outside the enum", () => {
    expect(expectFirstIssue(updateProductPresentationValidator, {
      ...VALID_PRESENTATION,
      id: VALID_UUID,
      status: "archived",
    })).toBe("validators.product_status.invalid");
  });

  it("rejects an invalid name when provided", () => {
    expect(expectFirstIssue(updateProductPresentationValidator, {
      ...VALID_PRESENTATION,
      id: VALID_UUID,
      status: "active",
      name: "ab",
    })).toBe("validators.name.min_length");
  });
});

const VALID_CREATE_PRODUCT = {
  name: "Café Grano Premium",
  categoryId: VALID_UUID,
  description: "Café de origen colombiano",
  stock: 50,
  minStock: 5,
  allowNegativeStock: false,
  presentations: [VALID_PRESENTATION],
};

describe("createProductValidator", () => {
  it("accepts a complete valid product", () => {
    const data = expectParsed(createProductValidator, VALID_CREATE_PRODUCT);
    expect(data.name).toBe("Café Grano Premium");
    expect(data.categoryId).toBe(VALID_UUID);
    expect(data.description).toBe("Café de origen colombiano");
    expect(data.stock).toBe(50);
    expect(data.minStock).toBe(5);
    expect(data.allowNegativeStock).toBe(false);
    expect(data.presentations).toHaveLength(1);
  });

  it("accepts allowNegativeStock set to true", () => {
    const data = expectParsed(createProductValidator, {
      ...VALID_CREATE_PRODUCT,
      allowNegativeStock: true,
    });
    expect(data.allowNegativeStock).toBe(true);
  });

  it("converts an empty categoryId to undefined", () => {
    const data = expectParsed(createProductValidator, {
      ...VALID_CREATE_PRODUCT,
      categoryId: "",
    });
    expect(data.categoryId).toBeUndefined();
  });

  it("accepts an empty description", () => {
    expectParsed(createProductValidator, {
      ...VALID_CREATE_PRODUCT,
      description: "",
    });
  });

  it("coerces string stock and minimum stock", () => {
    const data = expectParsed(createProductValidator, {
      ...VALID_CREATE_PRODUCT,
      stock: "50",
      minStock: "5",
    });
    expect(data.stock).toBe(50);
    expect(data.minStock).toBe(5);
  });

  it("rejects a malformed categoryId", () => {
    expect(expectFirstIssue(createProductValidator, {
      ...VALID_CREATE_PRODUCT,
      categoryId: "not-a-uuid",
    })).toBe("validators.uuid.invalid");
  });

  it("rejects a non-boolean allowNegativeStock", () => {
    expect(expectFirstIssue(createProductValidator, {
      ...VALID_CREATE_PRODUCT,
      allowNegativeStock: "true",
    })).toMatch(/expected boolean/);
  });

  it("rejects an empty presentations array", () => {
    expect(expectFirstIssue(createProductValidator, {
      ...VALID_CREATE_PRODUCT,
      presentations: [],
    })).toBe("validators.array.presentations.at_least_one");
  });

  it("rejects a missing presentations field", () => {
    const { presentations: _presentations, ...withoutPresentations } =
      VALID_CREATE_PRODUCT;
    expect(expectFirstIssue(createProductValidator, withoutPresentations)).toMatch(
      /expected array/,
    );
  });

  it("rejects a zero stock", () => {
    expect(expectFirstIssue(createProductValidator, {
      ...VALID_CREATE_PRODUCT,
      stock: 0,
    })).toBe("validators.stock.positive");
  });

  it("rejects a zero minimum stock", () => {
    expect(expectFirstIssue(createProductValidator, {
      ...VALID_CREATE_PRODUCT,
      minStock: 0,
    })).toBe("validators.min_stock.positive");
  });

  it("rejects a name shorter than 5 characters", () => {
    expect(expectFirstIssue(createProductValidator, {
      ...VALID_CREATE_PRODUCT,
      name: "ab",
    })).toBe("validators.name.min_length");
  });

  it("rejects a description shorter than 15 characters", () => {
    expect(expectFirstIssue(createProductValidator, {
      ...VALID_CREATE_PRODUCT,
      description: "x",
    })).toBe("validators.description.min_length");
  });

  it("rejects an invalid presentation inside the array", () => {
    expect(expectFirstIssue(createProductValidator, {
      ...VALID_CREATE_PRODUCT,
      presentations: [{ ...VALID_PRESENTATION, priceSale: 0 }],
    })).toBe("validators.price_sale.positive");
  });
});

const VALID_UPDATE_PRODUCT = {
  ...VALID_CREATE_PRODUCT,
  id: VALID_UUID,
  status: "active",
  presentations: [{ ...VALID_PRESENTATION, id: VALID_UUID, status: "active" }],
} as const;

describe("updateProductValidator", () => {
  it("accepts a complete valid update payload", () => {
    const data = expectParsed(updateProductValidator, VALID_UPDATE_PRODUCT);
    expect(data.id).toBe(VALID_UUID);
    expect(data.status).toBe("active");
    expect(data.presentations[0]!.id).toBe(VALID_UUID);
  });

  it("accepts every product status value", () => {
    for (const status of ["active", "inactive", "discontinued"] as const) {
      expectParsed(updateProductValidator, {
        ...VALID_UPDATE_PRODUCT,
        status,
      });
    }
  });

  it("rejects a missing id", () => {
    const { id: _id, ...withoutId } = VALID_UPDATE_PRODUCT;
    expect(expectFirstIssue(updateProductValidator, withoutId)).toBe(
      "validators.uuid.invalid",
    );
  });

  it("rejects a status outside the enum", () => {
    expect(expectFirstIssue(updateProductValidator, {
      ...VALID_UPDATE_PRODUCT,
      status: "archived",
    })).toBe("validators.product_status.invalid");
  });

  it("rejects a presentation without an id", () => {
    expect(expectFirstIssue(updateProductValidator, {
      ...VALID_UPDATE_PRODUCT,
      presentations: [{ ...VALID_PRESENTATION, status: "active" }],
    })).toBe("validators.uuid.invalid");
  });

  it("rejects an empty presentations array", () => {
    expect(expectFirstIssue(updateProductValidator, {
      ...VALID_UPDATE_PRODUCT,
      presentations: [],
    })).toBe("validators.array.presentations.at_least_one");
  });
});

describe("deleteProductValidator", () => {
  it("accepts a valid product id", () => {
    expect(expectParsed(deleteProductValidator, { id: VALID_UUID }).id).toBe(
      VALID_UUID,
    );
  });

  it("rejects an invalid product id", () => {
    expect(expectFirstIssue(deleteProductValidator, { id: "not-a-uuid" })).toBe(
      "validators.uuid.invalid",
    );
  });

  it("rejects a missing id", () => {
    expect(expectFirstIssue(deleteProductValidator, {})).toBe(
      "validators.uuid.invalid",
    );
  });
});