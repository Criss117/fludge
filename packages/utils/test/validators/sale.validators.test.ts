import { describe, expect, it } from "bun:test";
import type { ZodType } from "zod";

import {
  cancelSaleValidator,
  createSaleItemValidator,
  createSaleValidator,
  paymentTypeSchema,
  priceSchema,
  quantitySchema,
  refundSaleItemsValidator,
  saleStatusSchema,
} from "../../src/validators/sale.validators";

const VALID_UUID = "00000000-0000-4000-8000-000000000001";
const OTHER_UUID = "00000000-0000-4000-8000-000000000002";

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

describe("paymentTypeSchema", () => {
  it("accepts every payment type", () => {
    for (const paymentType of ["cash", "credit"] as const) {
      expect(expectParsed(paymentTypeSchema, paymentType)).toBe(paymentType);
    }
  });

  it("rejects a value outside the enum", () => {
    expect(expectFirstIssue(paymentTypeSchema, "card")).toBe(
      "validators.payment_type.invalid",
    );
  });

  it("rejects an empty string, null and undefined", () => {
    expect(expectFirstIssue(paymentTypeSchema, "")).toBe(
      "validators.payment_type.invalid",
    );
    expect(expectFirstIssue(paymentTypeSchema, null)).toBe(
      "validators.payment_type.invalid",
    );
    expect(expectFirstIssue(paymentTypeSchema, undefined)).toBe(
      "validators.payment_type.invalid",
    );
  });
});

describe("saleStatusSchema", () => {
  it("accepts every sale status", () => {
    for (const status of ["open", "partial", "completed", "cancelled"] as const) {
      expect(expectParsed(saleStatusSchema, status)).toBe(status);
    }
  });

  it("rejects a value outside the enum", () => {
    expect(expectFirstIssue(saleStatusSchema, "pending")).toBe(
      "validators.sale_status.invalid",
    );
  });

  it("rejects case mismatches and non-string values", () => {
    expect(expectFirstIssue(saleStatusSchema, "OPEN")).toBe(
      "validators.sale_status.invalid",
    );
    expect(expectFirstIssue(saleStatusSchema, 1)).toBe(
      "validators.sale_status.invalid",
    );
  });
});

describe("quantitySchema", () => {
  it("accepts a positive integer quantity", () => {
    expect(expectParsed(quantitySchema, 3)).toBe(3);
  });

  it("accepts a positive decimal quantity", () => {
    expect(expectParsed(quantitySchema, 1.5)).toBe(1.5);
  });

  it("rejects zero and negative quantities", () => {
    expect(expectFirstIssue(quantitySchema, 0)).toBe(
      "validators.quantity.positive",
    );
    expect(expectFirstIssue(quantitySchema, -1)).toBe(
      "validators.quantity.positive",
    );
  });

  it("rejects a numeric string (no coercion)", () => {
    expect(expectFirstIssue(quantitySchema, "2")).toBe(
      "validators.quantity.invalid",
    );
  });

  it("rejects null and undefined", () => {
    expect(expectFirstIssue(quantitySchema, null)).toBe(
      "validators.quantity.invalid",
    );
    expect(expectFirstIssue(quantitySchema, undefined)).toBe(
      "validators.quantity.invalid",
    );
  });
});

describe("priceSchema", () => {
  it("accepts a positive integer price", () => {
    expect(expectParsed(priceSchema, 5000)).toBe(5000);
  });

  it("accepts a positive decimal price", () => {
    expect(expectParsed(priceSchema, 2.5)).toBe(2.5);
  });

  it("rejects zero and negative prices", () => {
    expect(expectFirstIssue(priceSchema, 0)).toBe(
      "validators.price_sale.positive",
    );
    expect(expectFirstIssue(priceSchema, -1)).toBe(
      "validators.price_sale.positive",
    );
  });

  it("rejects a numeric string (no coercion)", () => {
    expect(expectFirstIssue(priceSchema, "5000")).toBe(
      "validators.price_sale.invalid",
    );
  });
});

const VALID_SALE_ITEM = {
  quantity: 2,
  price: 1000,
  name: "Café Grano 500g",
};

describe("createSaleItemValidator", () => {
  it("accepts an item with a name", () => {
    const data = expectParsed(createSaleItemValidator, VALID_SALE_ITEM);
    expect(data.quantity).toBe(2);
    expect(data.price).toBe(1000);
    expect(data.name).toBe("Café Grano 500g");
  });

  it("accepts an item with a presentation id", () => {
    const data = expectParsed(createSaleItemValidator, {
      quantity: 2,
      price: 1000,
      presentationId: VALID_UUID,
    });
    expect(data.presentationId).toBe(VALID_UUID);
  });

  it("trims the name", () => {
    const data = expectParsed(createSaleItemValidator, {
      ...VALID_SALE_ITEM,
      name: "  Café Grano 500g  ",
    });
    expect(data.name).toBe("Café Grano 500g");
  });

  it("rejects an item without a name or a presentation id", () => {
    expect(expectFirstIssue(createSaleItemValidator, {
      quantity: 2,
      price: 1000,
    })).toBe("Invalid input");
  });

  it("rejects a zero quantity", () => {
    expect(expectFirstIssue(createSaleItemValidator, {
      ...VALID_SALE_ITEM,
      quantity: 0,
    })).toBe("validators.quantity.positive");
  });

  it("rejects a non-number quantity", () => {
    expect(expectFirstIssue(createSaleItemValidator, {
      ...VALID_SALE_ITEM,
      quantity: "2",
    })).toBe("Invalid input");
  });

  it("rejects a non-number price", () => {
    expect(expectFirstIssue(createSaleItemValidator, {
      ...VALID_SALE_ITEM,
      price: "1000",
    })).toBe("Invalid input");
  });

  it("rejects a name shorter than 5 characters", () => {
    expect(expectFirstIssue(createSaleItemValidator, {
      ...VALID_SALE_ITEM,
      name: "ab",
    })).toBe("validators.name.min_length");
  });

  it("rejects an invalid presentation id", () => {
    expect(expectFirstIssue(createSaleItemValidator, {
      quantity: 2,
      price: 1000,
      presentationId: "not-a-uuid",
    })).toBe("validators.uuid.invalid");
  });
});

const VALID_CREATE_SALE = {
  paymentType: "cash",
  notes: "",
  items: [VALID_SALE_ITEM],
};

describe("createSaleValidator", () => {
  it("accepts a complete valid sale without a customer", () => {
    const data = expectParsed(createSaleValidator, VALID_CREATE_SALE);
    expect(data.paymentType).toBe("cash");
    expect(data.notes).toBe("");
    expect(data.items).toHaveLength(1);
    expect(data.customerId).toBeUndefined();
  });

  it("accepts a sale with a customer id", () => {
    const data = expectParsed(createSaleValidator, {
      ...VALID_CREATE_SALE,
      customerId: VALID_UUID,
    });
    expect(data.customerId).toBe(VALID_UUID);
  });

  it("accepts a credit sale", () => {
    const data = expectParsed(createSaleValidator, {
      ...VALID_CREATE_SALE,
      paymentType: "credit",
    });
    expect(data.paymentType).toBe("credit");
  });

  it("accepts multiple items", () => {
    const data = expectParsed(createSaleValidator, {
      ...VALID_CREATE_SALE,
      items: [
        VALID_SALE_ITEM,
        { quantity: 1, price: 1500, name: "Café Tinto 250g" },
      ],
    });
    expect(data.items).toHaveLength(2);
  });

  it("accepts notes at their boundaries (15 and 100 characters)", () => {
    expectParsed(createSaleValidator, {
      ...VALID_CREATE_SALE,
      notes: "a".repeat(15),
    });
    expectParsed(createSaleValidator, {
      ...VALID_CREATE_SALE,
      notes: "a".repeat(100),
    });
  });

  it("rejects a payment type outside the enum", () => {
    expect(expectFirstIssue(createSaleValidator, {
      ...VALID_CREATE_SALE,
      paymentType: "card",
    })).toBe("validators.payment_type.invalid");
  });

  it("rejects notes shorter than 15 characters", () => {
    expect(expectFirstIssue(createSaleValidator, {
      ...VALID_CREATE_SALE,
      notes: "x",
    })).toBe("validators.notes.min_length");
  });

  it("rejects a non-string notes value", () => {
    expect(expectFirstIssue(createSaleValidator, {
      ...VALID_CREATE_SALE,
      notes: null,
    })).toBe("Invalid input");
  });

  it("rejects an empty items array", () => {
    expect(expectFirstIssue(createSaleValidator, {
      ...VALID_CREATE_SALE,
      items: [],
    })).toBe("validators.array.sale_items.at_least_one");
  });

  it("rejects a missing items field", () => {
    const { items: _items, ...withoutItems } = VALID_CREATE_SALE;
    expect(expectFirstIssue(createSaleValidator, withoutItems)).toMatch(
      /expected array/,
    );
  });

  it("rejects a non-array items value", () => {
    expect(expectFirstIssue(createSaleValidator, {
      ...VALID_CREATE_SALE,
      items: "x",
    })).toMatch(/expected array/);
  });

  it("rejects an invalid customer id", () => {
    expect(expectFirstIssue(createSaleValidator, {
      ...VALID_CREATE_SALE,
      customerId: "not-a-uuid",
    })).toBe("validators.uuid.invalid");
  });

  it("rejects an invalid item inside the array", () => {
    expect(expectFirstIssue(createSaleValidator, {
      ...VALID_CREATE_SALE,
      items: [{ quantity: 1, price: 1000, name: "ab" }],
    })).toBe("validators.name.min_length");
  });

  it("rejects an item with a zero quantity inside the array", () => {
    expect(expectFirstIssue(createSaleValidator, {
      ...VALID_CREATE_SALE,
      items: [{ ...VALID_SALE_ITEM, quantity: 0 }],
    })).toBe("validators.quantity.positive");
  });
});

describe("refundSaleItemsValidator", () => {
  it("accepts a sale id with a single item id", () => {
    const data = expectParsed(refundSaleItemsValidator, {
      id: VALID_UUID,
      itemIds: [OTHER_UUID],
    });
    expect(data.id).toBe(VALID_UUID);
    expect(data.itemIds).toEqual([OTHER_UUID]);
  });

  it("accepts multiple item ids", () => {
    const data = expectParsed(refundSaleItemsValidator, {
      id: VALID_UUID,
      itemIds: [OTHER_UUID, VALID_UUID],
    });
    expect(data.itemIds).toEqual([OTHER_UUID, VALID_UUID]);
  });

  it("rejects an empty itemIds array", () => {
    expect(expectFirstIssue(refundSaleItemsValidator, {
      id: VALID_UUID,
      itemIds: [],
    })).toBe("validators.array.sale_items.at_least_one");
  });

  it("rejects an invalid uuid inside itemIds", () => {
    expect(expectFirstIssue(refundSaleItemsValidator, {
      id: VALID_UUID,
      itemIds: ["not-a-uuid"],
    })).toBe("validators.uuid.invalid");
  });

  it("rejects a missing itemIds field", () => {
    expect(expectFirstIssue(refundSaleItemsValidator, { id: VALID_UUID })).toMatch(
      /expected array/,
    );
  });

  it("rejects a missing id", () => {
    expect(expectFirstIssue(refundSaleItemsValidator, {
      itemIds: [VALID_UUID],
    })).toBe("validators.uuid.invalid");
  });
});

describe("cancelSaleValidator", () => {
  it("accepts a complete valid cancellation", () => {
    const data = expectParsed(cancelSaleValidator, {
      id: VALID_UUID,
      cancellationReason: "El cliente canceló la compra",
    });
    expect(data.id).toBe(VALID_UUID);
    expect(data.cancellationReason).toBe("El cliente canceló la compra");
  });

  it("accepts an empty cancellation reason", () => {
    const data = expectParsed(cancelSaleValidator, {
      id: VALID_UUID,
      cancellationReason: "",
    });
    expect(data.cancellationReason).toBe("");
  });

  it("accepts a reason at its boundaries (15 and 100 characters)", () => {
    expectParsed(cancelSaleValidator, {
      id: VALID_UUID,
      cancellationReason: "a".repeat(15),
    });
    expectParsed(cancelSaleValidator, {
      id: VALID_UUID,
      cancellationReason: "a".repeat(100),
    });
  });

  it("rejects a reason shorter than 15 characters", () => {
    expect(expectFirstIssue(cancelSaleValidator, {
      id: VALID_UUID,
      cancellationReason: "x",
    })).toBe("validators.notes.min_length");
  });

  it("rejects a reason longer than 100 characters", () => {
    expect(expectFirstIssue(cancelSaleValidator, {
      id: VALID_UUID,
      cancellationReason: "a".repeat(101),
    })).toBe("validators.notes.max_length");
  });

  it("rejects an invalid id", () => {
    expect(expectFirstIssue(cancelSaleValidator, {
      id: "not-a-uuid",
      cancellationReason: "El cliente canceló la compra",
    })).toBe("validators.uuid.invalid");
  });

  it("rejects a missing id", () => {
    expect(expectFirstIssue(cancelSaleValidator, {
      cancellationReason: "El cliente canceló la compra",
    })).toBe("validators.uuid.invalid");
  });
});