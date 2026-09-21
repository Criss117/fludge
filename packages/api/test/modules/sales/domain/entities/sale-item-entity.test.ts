import { describe, expect, it } from "bun:test";

import { SaleItem } from "@fludge/api/modules/sales/domain/entities/sale-item.entity";
import { SaleItemCollection } from "@fludge/api/modules/sales/domain/entities/sale-item-collection";
import { DuplicatedSaleItemException } from "@fludge/api/modules/sales/domain/exceptions/duplicated-sale-item.exception";
import { SaleItemNotFoundException } from "@fludge/api/modules/sales/domain/exceptions/sale-item-not-found.exception";
import { makeSaleItem, SALE_PRESENTATION_ID } from "@test/support/builders/sale.builder";
import { UUID } from "@fludge/utils/uuid";

// ---------------------------------------------------------------------------
// SaleItem
// ---------------------------------------------------------------------------

describe("SaleItem.create", () => {
  it("creates an item with active status and computed subtotal", () => {
    const item = makeSaleItem({ quantity: 2, unitPrice: 1000 });

    expect(item.values.name).toBe("Agua");
    expect(item.values.quantity).toBe(2);
    expect(item.values.unitPrice).toBe(1000);
    expect(item.values.subtotal).toBe(2000);
    expect(item.values.status).toBe("active");
    expect(item.values.id).toBeTruthy();
  });

  it("stores product and presentation ids", () => {
    const item = makeSaleItem();

    expect(item.productId).not.toBeNull();
    expect(item.presentationId).not.toBeNull();
  });

  it("supports ad-hoc items without product references", () => {
    const item = makeSaleItem({ productId: null, presentationId: null, snapshot: false });

    expect(item.productId).toBeNull();
    expect(item.presentationId).toBeNull();
    expect(item.productSnapshot).toBeNull();
  });
});

describe("SaleItem.update", () => {
  it("updates quantity, price and status", () => {
    const item = makeSaleItem();

    item.update({ quantity: 5, price: 1500, status: "inactive" });

    expect(item.values.quantity).toBe(5);
    expect(item.values.unitPrice).toBe(1500);
    expect(item.values.status).toBe("inactive");
  });

  it("ignores non-positive quantity and price", () => {
    const item = makeSaleItem({ quantity: 2, unitPrice: 1000 });

    item.update({ quantity: 0, price: 0 });

    expect(item.values.quantity).toBe(2);
    expect(item.values.unitPrice).toBe(1000);
  });

  it("touches the updatedAt timestamp", () => {
    const item = makeSaleItem();
    const before = item.values.updatedAt.getTime();

    item.update({ quantity: 3 });

    expect(item.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
});

describe("SaleItem.getters", () => {
  it("exposes productSnapshot", () => {
    const item = makeSaleItem();

    expect(item.productSnapshot).not.toBeNull();
    expect(item.productSnapshot!.productId).toBe(item.productId!.toString());
    expect(item.productSnapshot!.presentationId).toBe(
      item.presentationId!.toString(),
    );
  });
});

// ---------------------------------------------------------------------------
// SaleItemCollection
// ---------------------------------------------------------------------------

describe("SaleItemCollection", () => {
  it("exists checks by id", () => {
    const item = makeSaleItem();
    const collection = new SaleItemCollection([item]);

    expect(collection.exists(item.id.toString())).toBe(true);
    expect(collection.exists(UUID.generate().toString())).toBe(false);
    expect(collection.exists([item.id.toString()])).toBe(true);
  });

  it("finds by id and presentation id", () => {
    const item = makeSaleItem();
    const collection = new SaleItemCollection([item]);

    expect(collection.findById(item.id.toString())).not.toBeNull();
    expect(collection.findByPresentationId(SALE_PRESENTATION_ID)).not.toBeNull();
    expect(collection.findByPresentationId("00000000-0000-4000-8000-000000000999")).toBeNull();
  });

  it("adds an item", () => {
    const collection = new SaleItemCollection([]);
    const item = makeSaleItem({ presentationId: SALE_PRESENTATION_ID });

    collection.add(item);

    expect(collection.values).toHaveLength(1);
  });

  it("throws DuplicatedSaleItemException when the presentation is repeated", () => {
    const item = makeSaleItem({ presentationId: SALE_PRESENTATION_ID });
    const collection = new SaleItemCollection([item]);
    const duplicated = makeSaleItem({ presentationId: SALE_PRESENTATION_ID });

    expect(() => collection.add(duplicated)).toThrow(DuplicatedSaleItemException);
  });

  it("allows adding ad-hoc items without presentation", () => {
    const collection = new SaleItemCollection([]);
    const a = makeSaleItem({ productId: null, presentationId: null, snapshot: false });
    const b = makeSaleItem({ productId: null, presentationId: null, snapshot: false });

    collection.add(a);
    collection.add(b);

    expect(collection.values).toHaveLength(2);
  });

  it("update replaces an existing item", () => {
    const item = makeSaleItem();
    const collection = new SaleItemCollection([item]);
    // Reconstituimos un item con el MISMO id pero valores actualizados
    const updated = SaleItem.reconstitute({
      id: item.id.toString(),
      saleId: "00000000-0000-4000-8000-000000000000",
      productId: item.productId?.toString() ?? null,
      productPresentationId: item.presentationId?.toString() ?? null,
      productSnapshot: item.productSnapshot?.value ?? null,
      name: "Cambiado",
      unitPrice: 2000,
      quantity: 5,
      subtotal: 10000,
      organizationId: "00000000-0000-4000-8000-000000000001",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    collection.update(updated);

    const found = collection.findById(item.id.toString())!;
    expect(found.values.name).toBe("Cambiado");
    expect(found.values.quantity).toBe(5);
  });

  it("update throws SaleItemNotFoundException when missing", () => {
    const collection = new SaleItemCollection([]);

    expect(() => collection.update(makeSaleItem())).toThrow(
      SaleItemNotFoundException,
    );
  });

  it("delete removes an item", () => {
    const item = makeSaleItem();
    const collection = new SaleItemCollection([item]);

    collection.delete(item.id.toString());

    expect(collection.values).toHaveLength(0);
  });

  it("delete throws SaleItemNotFoundException when missing", () => {
    const collection = new SaleItemCollection([]);

    expect(() => collection.delete(UUID.generate().toString())).toThrow(
      SaleItemNotFoundException,
    );
  });

  it("calculateTotal sums the subtotals", () => {
    const a = makeSaleItem({ presentationId: SALE_PRESENTATION_ID, quantity: 2, unitPrice: 1000 });
    const b = makeSaleItem({ presentationId: "00000000-0000-4000-8000-000000000005", quantity: 3, unitPrice: 2000 });
    const collection = new SaleItemCollection([a, b]);

    expect(collection.calculateTotal()).toBe(8000);
  });

  it("hasDuplicatedPresentations detects duplicates", () => {
    const a = makeSaleItem({ presentationId: SALE_PRESENTATION_ID });
    const b = makeSaleItem({ presentationId: SALE_PRESENTATION_ID });
    const collection = new SaleItemCollection([a, b]);

    expect(collection.hasDuplicatedPresentations()).toBe(true);
  });

  it("getProductIdsByItemIds returns unique product ids", () => {
    const a = makeSaleItem({ presentationId: SALE_PRESENTATION_ID });
    const b = makeSaleItem({ presentationId: "00000000-0000-4000-8000-000000000005" });
    const collection = new SaleItemCollection([a, b]);

    const ids = collection.getProductIdsByItemIds([
      a.id.toString(),
      b.id.toString(),
    ]);

    expect(ids).toHaveLength(1);
  });

  it("getProductIdsByItemIds throws when an item is missing", () => {
    const item = makeSaleItem();
    const collection = new SaleItemCollection([item]);

    expect(() =>
      collection.getProductIdsByItemIds([
        item.id.toString(),
        UUID.generate().toString(),
      ]),
    ).toThrow(SaleItemNotFoundException);
  });

  it("productIds getter returns unique product ids", () => {
    const a = makeSaleItem({ presentationId: SALE_PRESENTATION_ID });
    const b = makeSaleItem({ presentationId: "00000000-0000-4000-8000-000000000005" });
    const collection = new SaleItemCollection([a, b]);

    expect(collection.productIds).toEqual([a.productId!.toString()]);
  });
});