import { describe, expect, it } from "bun:test";

import { updateProductCommand } from "@fludge/api/modules/catalog/products/application/commands/update-product.command";
import { UpdateProductCommand } from "@fludge/api/modules/catalog/products/application/commands/update-product.command";

// ---------------------------------------------------------------------------
// Minimal in-memory mocks for the handler normalization tests.
// ---------------------------------------------------------------------------

type ExistingProduct = {
  id: string;
  organizationId: string;
  name: string;
  barcode: string;
  sku: string | null;
  categoryId: string | null;
  stockQuantity: number;
  allowNegativeStock: boolean;
};

function makeExisting(overrides: Partial<ExistingProduct> = {}): ExistingProduct {
  return {
    id: "00000000-0000-0000-0000-000000000000",
    organizationId: "org-1",
    name: "Gaseosa Cola 1.5L",
    barcode: "7791234567890",
    sku: null,
    categoryId: null,
    stockQuantity: 0,
    allowNegativeStock: false,
    ...overrides,
  };
}

/** Captures the `values` passed to `update` so the test can assert on them. */
function makeRepos(
  existing: ExistingProduct,
  onValues: (v: Record<string, unknown>) => void,
) {
  const productsCommandsRepository = {
    async findOne(_id: string, _orgId: string) {
      return [existing, null] as const;
    },
    async checkUniqueFields() {
      return [
        {
          slugTaken: false,
          nameTaken: false,
          barcodeTaken: false,
          skuTaken: false,
        },
        null,
      ] as const;
    },
    async update(
      _id: string,
      _orgId: string,
      values: Record<string, unknown>,
    ) {
      onValues(values);
      return [{ ...existing, ...values }, null] as const;
    },
    async transaction<T>(fn: (tx: unknown) => Promise<T>) {
      return fn({});
    },
    async insertInventoryMovement() {
      return [null, null] as const;
    },
  };

  const categoriesCommandsRepository = {};

  return { productsCommandsRepository, categoriesCommandsRepository };
}

// ---------------------------------------------------------------------------
// Schema tests — shared constants
// ---------------------------------------------------------------------------

const baseUpdateInput = {
  id: "00000000-0000-0000-0000-000000000000",
  status: "active" as const,
};

const validBase = {
  name: "Gaseosa Cola 1.5L",
  barcode: "7791234567890",
  priceRetail: "15.00",
  pricePurchase: "10.00",
  priceWholesale: "8.50",
};

// ---------------------------------------------------------------------------
// Schema tests — PUT required-field enforcement
// ---------------------------------------------------------------------------

describe("updateProductCommand schema — required fields (PUT semantics)", () => {
  it("accepts a full valid payload", () => {
    const result = updateProductCommand.safeParse({
      ...baseUpdateInput,
      ...validBase,
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const { name: _name, ...withoutName } = {
      ...baseUpdateInput,
      ...validBase,
    };
    const result = updateProductCommand.safeParse(withoutName);

    expect(result.success).toBe(false);
  });

  it("rejects missing barcode", () => {
    const { barcode: _barcode, ...withoutBarcode } = {
      ...baseUpdateInput,
      ...validBase,
    };
    const result = updateProductCommand.safeParse(withoutBarcode);

    expect(result.success).toBe(false);
  });

  it("rejects missing priceRetail", () => {
    const { priceRetail: _price, ...withoutPrice } = {
      ...baseUpdateInput,
      ...validBase,
    };
    const result = updateProductCommand.safeParse(withoutPrice);

    expect(result.success).toBe(false);
  });

  it("rejects missing pricePurchase", () => {
    const { pricePurchase: _price, ...withoutPrice } = {
      ...baseUpdateInput,
      ...validBase,
    };
    const result = updateProductCommand.safeParse(withoutPrice);

    expect(result.success).toBe(false);
  });

  it("rejects missing priceWholesale", () => {
    const { priceWholesale: _price, ...withoutPrice } = {
      ...baseUpdateInput,
      ...validBase,
    };
    const result = updateProductCommand.safeParse(withoutPrice);

    expect(result.success).toBe(false);
  });

  it("rejects missing status", () => {
    const { status: _status, ...withoutStatus } = {
      ...baseUpdateInput,
      ...validBase,
    };
    const result = updateProductCommand.safeParse(withoutStatus);

    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Schema tests — negative-stock refine
// ---------------------------------------------------------------------------

describe("updateProductCommand schema — negative-stock refine", () => {
  it("rejects stockQuantity = -5 when allowNegativeStock is false", () => {
    const result = updateProductCommand.safeParse({
      ...baseUpdateInput,
      ...validBase,
      stockQuantity: -5,
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

  it("allows stockQuantity = -5 when allowNegativeStock is true", () => {
    const result = updateProductCommand.safeParse({
      ...baseUpdateInput,
      ...validBase,
      stockQuantity: -5,
      allowNegativeStock: true,
    });

    expect(result.success).toBe(true);
  });

  it("allows stockQuantity = 0 when allowNegativeStock is false", () => {
    const result = updateProductCommand.safeParse({
      ...baseUpdateInput,
      ...validBase,
      stockQuantity: 0,
      allowNegativeStock: false,
    });

    expect(result.success).toBe(true);
  });

  it("allows stockQuantity to be omitted", () => {
    const result = updateProductCommand.safeParse({
      ...baseUpdateInput,
      ...validBase,
    });

    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Schema tests — minimumStock refine
// ---------------------------------------------------------------------------

describe("updateProductCommand schema — minimumStock refine", () => {
  it("rejects minimumStock greater than stockQuantity", () => {
    const result = updateProductCommand.safeParse({
      ...baseUpdateInput,
      ...validBase,
      stockQuantity: 5,
      minimumStock: 10,
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

  it("accepts minimumStock equal to stockQuantity", () => {
    const result = updateProductCommand.safeParse({
      ...baseUpdateInput,
      ...validBase,
      stockQuantity: 5,
      minimumStock: 5,
    });

    expect(result.success).toBe(true);
  });

  it("accepts minimumStock less than stockQuantity", () => {
    const result = updateProductCommand.safeParse({
      ...baseUpdateInput,
      ...validBase,
      stockQuantity: 10,
      minimumStock: 5,
    });

    expect(result.success).toBe(true);
  });

  it("skips minimumStock refine when stockQuantity is undefined", () => {
    const result = updateProductCommand.safeParse({
      ...baseUpdateInput,
      ...validBase,
      minimumStock: 10,
    });

    expect(result.success).toBe(true);
  });

  it("skips minimumStock refine when minimumStock is undefined", () => {
    const result = updateProductCommand.safeParse({
      ...baseUpdateInput,
      ...validBase,
      stockQuantity: -5,
      allowNegativeStock: true,
    });

    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Handler normalization tests
// ---------------------------------------------------------------------------

describe("UpdateProductCommand handler — normalization on allowNegativeStock flip", () => {
  it("coerces stockQuantity to 0 when existing is -5 and allowNegativeStock flips to false (stock omitted)", async () => {
    const existing = makeExisting({
      stockQuantity: -5,
      allowNegativeStock: true,
    });

    let captured: Record<string, unknown> | null = null;
    const { productsCommandsRepository, categoriesCommandsRepository } =
      makeRepos(existing, (v) => {
        captured = v;
      });

    const command = new UpdateProductCommand(
      productsCommandsRepository as never,
      categoriesCommandsRepository as never,
    );

    await command.execute({
      ...updateProductCommand.parse({
        ...baseUpdateInput,
        ...validBase,
        allowNegativeStock: false,
      }),
      organizationId: "org-1",
      updatedBy: { memberId: "mem-1" },
    });

    expect(captured).not.toBeNull();
    expect(captured!.stockQuantity).toBe(0);
  });

  it("coerces stockQuantity to 0 when cmd omits stock but existing is -3 and allowNegativeStock flips to false", async () => {
    const existing = makeExisting({
      stockQuantity: -3,
      allowNegativeStock: true,
    });

    let captured: Record<string, unknown> | null = null;
    const { productsCommandsRepository, categoriesCommandsRepository } =
      makeRepos(existing, (v) => {
        captured = v;
      });

    const command = new UpdateProductCommand(
      productsCommandsRepository as never,
      categoriesCommandsRepository as never,
    );

    await command.execute({
      ...updateProductCommand.parse({
        ...baseUpdateInput,
        ...validBase,
        allowNegativeStock: false,
      }),
      organizationId: "org-1",
      updatedBy: { memberId: "mem-1" },
    });

    expect(captured).not.toBeNull();
    expect(captured!.stockQuantity).toBe(0);
  });

  it("does not coerce stockQuantity when allowNegativeStock stays true", async () => {
    const existing = makeExisting({
      stockQuantity: -5,
      allowNegativeStock: true,
    });

    let captured: Record<string, unknown> | null = null;
    const { productsCommandsRepository, categoriesCommandsRepository } =
      makeRepos(existing, (v) => {
        captured = v;
      });

    const command = new UpdateProductCommand(
      productsCommandsRepository as never,
      categoriesCommandsRepository as never,
    );

    await command.execute({
      ...updateProductCommand.parse({
        ...baseUpdateInput,
        ...validBase,
        stockQuantity: -5,
        allowNegativeStock: true,
      }),
      organizationId: "org-1",
      updatedBy: { memberId: "mem-1" },
    });

    // No stock change vs existing → no stockQuantity write emitted.
    expect(captured).not.toBeNull();
    expect(captured!.stockQuantity).toBeUndefined();
  });

  it("does not write stockQuantity when stock is already non-negative and unchanged", async () => {
    const existing = makeExisting({
      stockQuantity: 10,
      allowNegativeStock: true,
    });

    let captured: Record<string, unknown> | null = null;
    const { productsCommandsRepository, categoriesCommandsRepository } =
      makeRepos(existing, (v) => {
        captured = v;
      });

    const command = new UpdateProductCommand(
      productsCommandsRepository as never,
      categoriesCommandsRepository as never,
    );

    await command.execute({
      ...updateProductCommand.parse({
        ...baseUpdateInput,
        ...validBase,
        allowNegativeStock: false,
      }),
      organizationId: "org-1",
      updatedBy: { memberId: "mem-1" },
    });

    // existing was non-negative; coercion to 0 not triggered, no change.
    expect(captured).not.toBeNull();
    expect(captured!.stockQuantity).toBeUndefined();
  });
});