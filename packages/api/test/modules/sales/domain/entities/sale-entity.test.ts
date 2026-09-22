import { describe, expect, it } from "bun:test";

import { Sale } from "@fludge/api/modules/sales/domain/entities/sale.entity";
import { SaleNumber } from "@fludge/api/modules/sales/domain/value-objects/sale-number";
import { SaleStatus } from "@fludge/api/modules/sales/domain/value-objects/sale-status";
import { PaymentType } from "@fludge/api/modules/sales/domain/value-objects/payment-type";
import { SaleCancellation } from "@fludge/api/modules/sales/domain/value-objects/sale-cancellation";
import { SaleItemSnapshot } from "@fludge/api/modules/sales/domain/value-objects/sale-item-snapshot";
import { DuplicatedSaleItemException } from "@fludge/api/modules/sales/domain/exceptions/duplicated-sale-item.exception";
import { CantChangeSaleStatusException } from "@fludge/api/modules/sales/domain/exceptions/cant-change-sale-status";
import { SaleItemNotFoundException } from "@fludge/api/modules/sales/domain/exceptions/sale-item-not-found.exception";
import { AmountMustBePositiveException } from "@fludge/api/modules/shared/domain/exceptions/amount-must-be-positive.exception";
import {
  buildSale,
  makeCatalogItem,
  makeAdHocItem,
  SALE_ORG_ID,
  SALE_USER_ID,
  SALE_PRODUCT_ID,
  SALE_PRESENTATION_ID,
} from "@test/support/builders/sale.builder";
import { UUID } from "@fludge/utils/uuid";
import type { SaleItemSelect, SaleSelect } from "@fludge/db/schema/sales.schema";

// ---------------------------------------------------------------------------
// Sale.create
// ---------------------------------------------------------------------------

describe("Sale.create", () => {
  it("creates a cash sale as completed with computed total", () => {
    const sale = buildSale({ paymentType: "cash" });

    expect(sale.values.paymentType).toBe("cash");
    expect(sale.values.status).toBe("completed");
    expect(sale.values.total).toBe(2000); // 2 * 1000
    expect(sale.values.notes).toBeNull();
    expect(sale.values.completedAt).toBeNull();
    expect(sale.values.cancelReason).toBeNull();
    expect(sale.values.id).toBeTruthy();
  });

  it("creates a credit sale as open", () => {
    const sale = buildSale({ paymentType: "credit" });

    expect(sale.values.status).toBe("open");
    expect(sale.values.customerId).toBeNull();
  });

  it("builds the sale number from the sequence", () => {
    const sale = buildSale({ sequence: 42 });

    expect(sale.values.saleNumber).toContain("-00042");
  });

  it("computes total with multiple items", () => {
    const sale = buildSale({
      items: [makeCatalogItem({ quantity: 2, unitPrice: 1000 }), makeAdHocItem({ quantity: 1, unitPrice: 5000 })],
    });

    expect(sale.values.total).toBe(7000);
  });

  it("throws DuplicatedSaleItemException with repeated presentations", () => {
    expect(() =>
      buildSale({
        items: [
          makeCatalogItem({ presentationId: SALE_PRESENTATION_ID }),
          makeCatalogItem({ presentationId: SALE_PRESENTATION_ID }),
        ],
      }),
    ).toThrow(DuplicatedSaleItemException);
  });
});

// ---------------------------------------------------------------------------
// Sale.reconstitute
// ---------------------------------------------------------------------------

describe("Sale.reconstitute", () => {
  function buildSaleSelect(): SaleSelect & { items: SaleItemSelect[] } {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const itemId = UUID.generate().toString();

    return {
      id: UUID.generate().toString(),
      organizationId: SALE_ORG_ID,
      createdBy: SALE_USER_ID,
      customerId: null,
      saleNumber: "SL-20260908-00001",
      paymentType: "cash",
      total: 2000,
      notes: null,
      status: "completed",
      cancelReason: null,
      cancelledAt: null,
      completedAt: now,
      createdAt: now,
      updatedAt: now,
      items: [
        {
          id: itemId,
          saleId: UUID.generate().toString(),
          productId: SALE_PRODUCT_ID,
          productPresentationId: SALE_PRESENTATION_ID,
          productSnapshot: {
            product: { id: SALE_PRODUCT_ID, name: "Agua", slug: "agua" },
            presentation: {
              id: SALE_PRESENTATION_ID,
              name: "Caja",
              barcode: "7501234567890",
              conversionFactor: 24,
            },
          },
          name: "Agua",
          unitPrice: 1000,
          quantity: 2,
          subtotal: 2000,
          organizationId: SALE_ORG_ID,
          status: "active",
          createdAt: now,
          updatedAt: now,
        },
      ],
    };
  }

  it("rebuilds a sale from select values", () => {
    const values = buildSaleSelect();
    const sale = Sale.reconstitute(values);

    expect(sale.values.id).toBe(values.id);
    expect(sale.values.saleNumber).toBe(values.saleNumber);
    expect(sale.values.status).toBe(values.status);
    expect(sale.values.total).toBe(values.total);
    expect(sale.values.items).toHaveLength(1);
  });

  it("reconstitutes a cancelled sale with cancellation data", () => {
    const values = buildSaleSelect();
    values.status = "cancelled";
    values.cancelReason = "Error del cajero";
    values.cancelledAt = new Date("2026-01-02T00:00:00.000Z");

    const sale = Sale.reconstitute(values);

    expect(sale.values.status).toBe("cancelled");
    expect(sale.values.cancelReason).toBe("Error del cajero");
    expect(sale.values.cancelledAt).toEqual(values.cancelledAt);
  });
});

// ---------------------------------------------------------------------------
// Sale.revertPayment
// ---------------------------------------------------------------------------

describe("Sale.revertPayment", () => {
  it("reverts a partial payment and keeps sale open", () => {
    const sale = buildSale({ paymentType: "credit" });
    sale.pay(1000);

    sale.revertPayment(500);

    expect(sale.values.totalPaid).toBe(500);
    expect(sale.values.status).toBe("open");
  });

  it("reverts a full payment and transitions completed sale back to open", () => {
    const sale = buildSale({ paymentType: "credit" });
    sale.pay(2000);
    expect(sale.values.status).toBe("completed");

    sale.revertPayment(2000);

    expect(sale.values.totalPaid).toBe(0);
    expect(sale.values.status).toBe("open");
    expect(sale.values.completedAt).toBeNull();
  });

  it("throws when revert amount exceeds totalPaid", () => {
    const sale = buildSale({ paymentType: "credit" });
    sale.pay(1000);

    expect(() => sale.revertPayment(1500)).toThrow(
      AmountMustBePositiveException,
    );
  });

  it("throws when revert amount is negative", () => {
    const sale = buildSale({ paymentType: "credit" });
    sale.pay(1000);

    expect(() => sale.revertPayment(-1)).toThrow(
      AmountMustBePositiveException,
    );
  });
});

// ---------------------------------------------------------------------------
// Sale.cancel
// ---------------------------------------------------------------------------

describe("Sale.cancel", () => {
  it("cancels an open sale and marks items inactive", () => {
    const sale = buildSale({ paymentType: "credit" });

    sale.cancel("Error del cajero");

    expect(sale.values.status).toBe("cancelled");
    expect(sale.values.cancelReason).toBe("Error del cajero");
    expect(sale.values.cancelledAt).not.toBeNull();
    expect(sale.values.items[0]!.status).toBe("inactive");
  });

  it("throws CantChangeSaleStatusException when cancelling a completed sale", () => {
    const sale = buildSale({ paymentType: "cash" });

    expect(() => sale.cancel("razón")).toThrow(CantChangeSaleStatusException);
  });

  it("throws CantChangeSaleStatusException when cancelling twice", () => {
    const sale = buildSale({ paymentType: "credit" });
    sale.cancel("primera");

    expect(() => sale.cancel("segunda")).toThrow(CantChangeSaleStatusException);
  });
});

// ---------------------------------------------------------------------------
// Sale.complete
// ---------------------------------------------------------------------------

describe("Sale.complete", () => {
  it("completes an open sale", () => {
    const sale = buildSale({ paymentType: "credit" });

    sale.complete();

    expect(sale.values.status).toBe("completed");
  });

  it("throws CantChangeSaleStatusException when already completed", () => {
    const sale = buildSale({ paymentType: "cash" });

    expect(() => sale.complete()).toThrow(CantChangeSaleStatusException);
  });
});

// ---------------------------------------------------------------------------
// Sale.refundItems
// ---------------------------------------------------------------------------

describe("Sale.refundItems", () => {
  it("refunds items and marks them inactive", () => {
    const sale = buildSale({
      paymentType: "credit",
      items: [
        makeCatalogItem({ quantity: 2, unitPrice: 1000 }),
        makeAdHocItem({ quantity: 1, unitPrice: 5000 }),
      ],
    });
    const itemToRefund = sale.items.values[1]!;

    const refunded = sale.refundItems([itemToRefund.id.toString()]);

    expect(refunded).toHaveLength(1);
    expect(refunded[0]!.values.status).toBe("inactive");
    // calculateTotal suma todos los items (no filtra por status),
    // por lo que el total de la venta no cambia con el refund.
    expect(sale.values.total).toBe(7000);
    expect(sale.items.values[1]!.values.status).toBe("inactive");
  });

  it("skips already inactive items", () => {
    const sale = buildSale({ paymentType: "credit" });
    const item = sale.items.values[0]!;

    sale.refundItems([item.id.toString()]);
    const second = sale.refundItems([item.id.toString()]);

    expect(second).toHaveLength(0);
  });

  it("throws SaleItemNotFoundException when the item does not exist", () => {
    const sale = buildSale();

    expect(() => sale.refundItems([UUID.generate().toString()])).toThrow(
      SaleItemNotFoundException,
    );
  });
});

// ---------------------------------------------------------------------------
// SaleNumber
// ---------------------------------------------------------------------------

describe("SaleNumber", () => {
  it("creates a formatted sale number", () => {
    const saleNumber = SaleNumber.create(42);

    expect(saleNumber.prefix).toBe("SL");
    expect(saleNumber.sequence).toBe(42);
    expect(saleNumber.value).toMatch(/^SL-\d{8}-00042$/);
  });

  it("rejects sequence below 1", () => {
    expect(() => SaleNumber.create(0)).toThrow();
  });

  it("fromString parses a formatted sale number", () => {
    const parsed = SaleNumber.fromString("SL-20260908-00042");

    expect(parsed.prefix).toBe("SL");
    expect(parsed.sequence).toBe(42);
    expect(parsed.date.getFullYear()).toBe(2026);
  });
});

// ---------------------------------------------------------------------------
// SaleStatus
// ---------------------------------------------------------------------------

describe("SaleStatus", () => {
  it("allows open -> completed and open -> cancelled", () => {
    const open = SaleStatus.open();

    expect(open.canTransitionTo("completed" as never)).toBe(true);
    expect(open.canTransitionTo("cancelled" as never)).toBe(true);
  });

  it("does not allow completed/cancelled transitions", () => {
    const completed = new SaleStatus("completed" as never);

    expect(completed.canTransitionTo("cancelled" as never)).toBe(false);
  });

  it("transitionTo throws on invalid transitions", () => {
    const completed = new SaleStatus("completed" as never);

    expect(() => completed.transitionTo("cancelled" as never)).toThrow(
      "Invalid sale status transition",
    );
  });

  it("complete and cancel helpers", () => {
    const open = SaleStatus.open();

    expect(open.complete().isCompleted()).toBe(true);
    expect(open.cancel().isCancelled()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// PaymentType / SaleCancellation / SaleItemSnapshot
// ---------------------------------------------------------------------------

describe("PaymentType", () => {
  it("distinguishes cash and credit", () => {
    const cash = new PaymentType("cash");
    const credit = new PaymentType("credit");

    expect(cash.isCash()).toBe(true);
    expect(credit.isCredit()).toBe(true);
    expect(cash.equals(credit)).toBe(false);
  });
});

describe("SaleCancellation", () => {
  it("stores reason and date", () => {
    const date = new Date("2026-01-01T00:00:00.000Z");
    const cancellation = new SaleCancellation("Error", date);

    expect(cancellation.reason).toBe("Error");
    expect(cancellation.cancelledAt).toBe(date);
    expect(cancellation.value).toEqual({ reason: "Error", cancelledAt: date });
  });
});

describe("SaleItemSnapshot", () => {
  it("exposes product and presentation ids", () => {
    const snapshot = new SaleItemSnapshot({
      product: { id: "p1", name: "Agua", slug: "agua" },
      presentation: {
        id: "pr1",
        name: "Caja",
        barcode: "123",
        conversionFactor: 24,
      },
    });

    expect(snapshot.productId).toBe("p1");
    expect(snapshot.presentationId).toBe("pr1");
  });
});