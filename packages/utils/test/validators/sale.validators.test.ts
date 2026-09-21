import { describe, expect, it } from "bun:test";

import {
  createSaleValidator,
  refundSaleItemsValidator,
  cancelSaleValidator,
  quantitySchema,
  priceSchema,
} from "@fludge/utils/validators/sale.validators";

const VALID_UUID = "00000000-0000-4000-8000-000000000001";

type SaleItemInput =
  | { presentationId: string; quantity: number; price: number }
  | { name: string; quantity: number; price: number };

type CreateSaleInput = {
  customerId?: string;
  paymentType: "cash" | "credit";
  notes: string;
  items: SaleItemInput[];
};

function validCreateSale(overrides?: Partial<CreateSaleInput>): CreateSaleInput {
  return {
    paymentType: "cash",
    notes: "",
    items: [
      {
        presentationId: VALID_UUID,
        quantity: 2,
        price: 1000,
      },
    ],
    ...overrides,
  };
}

describe("createSaleValidator", () => {
  it("accepts a valid cash sale", () => {
    expect(createSaleValidator.parse(validCreateSale())).toEqual(
      validCreateSale(),
    );
  });

  it("accepts an ad-hoc item", () => {
    const result = createSaleValidator.parse({
      paymentType: "cash",
      notes: "",
      items: [
        {
          name: "Servicio",
          quantity: 1,
          price: 5000,
        },
      ],
    });

    expect(result.items).toHaveLength(1);
  });

  it("rejects a sale without items", () => {
    expect(() =>
      createSaleValidator.parse(validCreateSale({ items: [] })),
    ).toThrow();
  });

  it("rejects an invalid payment type", () => {
    expect(() =>
      createSaleValidator.parse(validCreateSale({ paymentType: "card" as never })),
    ).toThrow();
  });

  it("rejects a non-positive quantity", () => {
    expect(() =>
      createSaleValidator.parse(
        validCreateSale({
          items: [{ presentationId: VALID_UUID, quantity: 0, price: 1000 }],
        }),
      ),
    ).toThrow();
  });

  it("rejects a short note", () => {
    expect(() =>
      createSaleValidator.parse(validCreateSale({ notes: "Corta" })),
    ).toThrow();
  });
});

describe("refundSaleItemsValidator", () => {
  it("accepts a valid refund", () => {
    expect(
      refundSaleItemsValidator.parse({ id: VALID_UUID, itemIds: [VALID_UUID] }),
    ).toEqual({ id: VALID_UUID, itemIds: [VALID_UUID] });
  });

  it("rejects an empty itemIds array", () => {
    expect(() =>
      refundSaleItemsValidator.parse({ id: VALID_UUID, itemIds: [] }),
    ).toThrow();
  });
});

describe("cancelSaleValidator", () => {
  it("accepts a valid cancellation", () => {
    const result = cancelSaleValidator.parse({
      id: VALID_UUID,
      cancellationReason: "",
    });

    expect(result.cancellationReason).toBe("");
  });

  it("rejects a short cancellation reason", () => {
    expect(() =>
      cancelSaleValidator.parse({
        id: VALID_UUID,
        cancellationReason: "Corta",
      }),
    ).toThrow();
  });
});

describe("quantitySchema", () => {
  it("accepts a positive quantity", () => {
    expect(quantitySchema.parse(2)).toBe(2);
  });

  it("rejects zero and negatives", () => {
    expect(() => quantitySchema.parse(0)).toThrow();
    expect(() => quantitySchema.parse(-1)).toThrow();
  });
});

describe("priceSchema", () => {
  it("accepts a positive price", () => {
    expect(priceSchema.parse(1000)).toBe(1000);
  });

  it("rejects zero and negatives", () => {
    expect(() => priceSchema.parse(0)).toThrow();
    expect(() => priceSchema.parse(-5)).toThrow();
  });
});