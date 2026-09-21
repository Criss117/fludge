import { describe, expect, it } from "bun:test";

import {
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
  createProductPresentationValidator,
  updateProductPresentationValidator,
  barcodeSchema,
  categoryIdSchema,
  pricePurchaseSchema,
  priceWholesaleSchema,
} from "@fludge/utils/validators/product.validators";

const VALID_UUID = "00000000-0000-4000-8000-000000000001";

type PresentationInput = {
  name: string;
  barcode?: string;
  conversionFactor: number;
  priceSale: number;
  pricePurchase?: number;
  priceWholesale?: number;
};

type CreateProductInput = {
  name: string;
  categoryId?: string;
  description: string;
  stock: number;
  minStock: number;
  allowNegativeStock: boolean;
  presentations: PresentationInput[];
};

function validPresentation(overrides?: Partial<PresentationInput>): PresentationInput {
  return {
    name: "Caja x24",
    barcode: "7501234567890",
    conversionFactor: 24,
    priceSale: 1000,
    pricePurchase: 800,
    priceWholesale: 900,
    ...overrides,
  };
}

function validCreateProduct(overrides?: Partial<CreateProductInput>): CreateProductInput {
  return {
    name: "Agua Mineral",
    // categoryId NO es opcional en el schema: acepta uuid o "" (que se transforma a undefined)
    categoryId: "",
    description: "Botella de agua mineral",
    stock: 100,
    minStock: 10,
    allowNegativeStock: false,
    presentations: [validPresentation()],
    ...overrides,
  };
}

describe("createProductValidator", () => {
  it("accepts a valid product", () => {
    const result = createProductValidator.parse(validCreateProduct());

    expect(result.name).toBe("Agua Mineral");
    expect(result.presentations).toHaveLength(1);
  });

  it("rejects a product without presentations", () => {
    expect(() =>
      createProductValidator.parse(validCreateProduct({ presentations: [] })),
    ).toThrow();
  });

  it("rejects a non-positive stock", () => {
    expect(() =>
      createProductValidator.parse(validCreateProduct({ stock: 0 })),
    ).toThrow();
  });

  it("rejects a short name", () => {
    expect(() =>
      createProductValidator.parse(validCreateProduct({ name: "ABC" })),
    ).toThrow();
  });
});

describe("updateProductValidator", () => {
  it("accepts a partial update with id and status", () => {
    const result = updateProductValidator.parse({
      id: VALID_UUID,
      name: "Agua Mineral",
      categoryId: "",
      description: "Descripción actualizada",
      stock: 200,
      minStock: 20,
      allowNegativeStock: false,
      status: "active",
      presentations: [
        {
          ...validPresentation(),
          id: VALID_UUID,
          status: "active",
        },
      ],
    });

    expect(result.name).toBe("Agua Mineral");
  });

  it("rejects a missing id", () => {
    expect(() => updateProductValidator.parse({})).toThrow();
  });
});

describe("deleteProductValidator", () => {
  it("accepts a valid id", () => {
    expect(deleteProductValidator.parse({ id: VALID_UUID })).toEqual({
      id: VALID_UUID,
    });
  });
});

describe("createProductPresentationValidator", () => {
  it("accepts a valid presentation", () => {
    const result = createProductPresentationValidator.parse(validPresentation());

    expect(result.name).toBe("Caja x24");
    expect(result.barcode).toBe("7501234567890");
    expect(result.conversionFactor).toBe(24);
    expect(result.priceSale).toBe(1000);
  });

  it("rejects a short barcode", () => {
    expect(() =>
      createProductPresentationValidator.parse(
        validPresentation({ barcode: "12345" }),
      ),
    ).toThrow();
  });

  it("rejects a non-positive conversion factor", () => {
    expect(() =>
      createProductPresentationValidator.parse(
        validPresentation({ conversionFactor: 0 }),
      ),
    ).toThrow();
  });

  it("rejects a non-positive sale price", () => {
    expect(() =>
      createProductPresentationValidator.parse(
        validPresentation({ priceSale: 0 }),
      ),
    ).toThrow();
  });
});

describe("updateProductPresentationValidator", () => {
  it("accepts a valid update with id and status", () => {
    const result = updateProductPresentationValidator.parse({
      ...validPresentation(),
      id: VALID_UUID,
      status: "inactive",
    });

    expect(result.status).toBe("inactive");
  });

  it("rejects a missing id", () => {
    expect(() =>
      updateProductPresentationValidator.parse({
        ...validPresentation(),
        status: "active",
      }),
    ).toThrow();
  });
});

describe("barcodeSchema", () => {
  it("accepts a valid barcode", () => {
    expect(barcodeSchema.parse("7501234567890")).toBe("7501234567890");
  });

  it("transforms an empty barcode to undefined", () => {
    expect(barcodeSchema.parse("")).toBeUndefined();
  });

  it("rejects a short barcode", () => {
    expect(() => barcodeSchema.parse("12345")).toThrow();
  });
});

describe("categoryIdSchema", () => {
  it("accepts a valid uuid", () => {
    expect(categoryIdSchema.parse(VALID_UUID)).toBe(VALID_UUID);
  });

  it("transforms an empty string to undefined", () => {
    expect(categoryIdSchema.parse("")).toBeUndefined();
  });
});

describe("pricePurchaseSchema", () => {
  it("accepts a valid price", () => {
    expect(pricePurchaseSchema.parse(800)).toBe(800);
  });

  it("transforms zero to undefined", () => {
    expect(pricePurchaseSchema.parse(0)).toBeUndefined();
  });
});

describe("priceWholesaleSchema", () => {
  it("accepts a valid price", () => {
    expect(priceWholesaleSchema.parse(900)).toBe(900);
  });

  it("transforms zero to undefined", () => {
    expect(priceWholesaleSchema.parse(0)).toBeUndefined();
  });
});