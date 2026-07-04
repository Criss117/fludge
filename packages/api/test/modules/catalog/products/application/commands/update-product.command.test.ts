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
    async update(_id: string, _orgId: string, values: Record<string, unknown>) {
      onValues(values);
      return [{ ...existing, ...values }, null] as const;
    },
  };

  const categoriesCommandsRepository = {};

  return { productsCommandsRepository, categoriesCommandsRepository };
}

// ---------------------------------------------------------------------------
// Schema tests
// ---------------------------------------------------------------------------

const baseUpdateInput = {
  id: "00000000-0000-0000-0000-000000000000",
};

const validCreateBase = {
  name: "Gaseosa Cola 1.5L",
  barcode: "7791234567890",
  priceRetail: "15.00",
  pricePurchase: "10.00",
  priceWholesale: "8.50",
};

describe("updateProductCommand schema — inherited negative-stock refine", () => {
  it("rejects stockQuantity = -5 when allowNegativeStock is false", () => {
    const result = updateProductCommand.safeParse({
      ...baseUpdateInput,
      ...validCreateBase,
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
      ...validCreateBase,
      stockQuantity: -5,
      allowNegativeStock: true,
    });

    expect(result.success).toBe(true);
  });

  it("allows stockQuantity = 0 when allowNegativeStock is false", () => {
    const result = updateProductCommand.safeParse({
      ...baseUpdateInput,
      ...validCreateBase,
      stockQuantity: 0,
      allowNegativeStock: false,
    });

    expect(result.success).toBe(true);
  });

  it("allows stockQuantity to be omitted (partial update)", () => {
    const result = updateProductCommand.safeParse({
      ...baseUpdateInput,
      ...validCreateBase,
    });

    expect(result.success).toBe(true);
  });
});

describe("updateProductCommand schema — minimumStock refine", () => {
  it("rejects minimumStock greater than stockQuantity", () => {
    const result = updateProductCommand.safeParse({
      ...baseUpdateInput,
      ...validCreateBase,
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
      ...validCreateBase,
      stockQuantity: 5,
      minimumStock: 5,
    });

    expect(result.success).toBe(true);
  });

  it("accepts minimumStock less than stockQuantity", () => {
    const result = updateProductCommand.safeParse({
      ...baseUpdateInput,
      ...validCreateBase,
      stockQuantity: 10,
      minimumStock: 5,
    });

    expect(result.success).toBe(true);
  });

  it("skips minimumStock refine when stockQuantity is undefined", () => {
    const result = updateProductCommand.safeParse({
      ...baseUpdateInput,
      ...validCreateBase,
      minimumStock: 10,
    });

    expect(result.success).toBe(true);
  });

  it("skips minimumStock refine when minimumStock is undefined", () => {
    const result = updateProductCommand.safeParse({
      ...baseUpdateInput,
      ...validCreateBase,
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
    // Per spec: existing stock -5 + allowNegativeStock true; update sets
    // allowNegativeStock:false WITHOUT changing stockQuantity. The schema
    // accepts this (stockQuantity absent → negative-stock refine skipped),
    // and the handler normalizes the effective (negative) stock to 0.
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
        ...validCreateBase,
        allowNegativeStock: false,
      }),
      organizationId: "org-1",
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
        ...validCreateBase,
        allowNegativeStock: false,
      }),
      organizationId: "org-1",
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
        ...validCreateBase,
        stockQuantity: -5,
        allowNegativeStock: true,
      }),
      organizationId: "org-1",
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
        ...validCreateBase,
        allowNegativeStock: false,
      }),
      organizationId: "org-1",
    });

    // existing was non-negative; coercion to 0 not triggered, no change.
    expect(captured).not.toBeNull();
    expect(captured!.stockQuantity).toBeUndefined();
  });
});