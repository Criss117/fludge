import { describe, expect, it } from "bun:test";

import { ProductPresentationCollection } from "@fludge/api/modules/catalog/products/domain/entities/product-presentation.collection";
import { ProductPresentation } from "@fludge/api/modules/catalog/products/domain/entities/product-presentation.entity";
import { ProductPresentationAlreadyExistsException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-presentation-already-exists.exception";
import { ProductPresentationNotFoundException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-presentation-not-found.exception";
import { ProductPresentationNoHasBarcodeException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-bresentation-no-has-barcode.exception";
import { DuplicatedBarcodeException } from "@fludge/api/modules/catalog/products/domain/exceptions/duplicated-barcode.exception";
import { UUID } from "@fludge/utils/uuid";
import { buildPresentation } from "@test/support/builders/product.builder";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildCollection(options?: { barcodes?: Array<string | null> }) {
  const presentations = (options?.barcodes ?? ["123", "456"]).map(
    (barcode, index) => buildPresentation({ barcode, name: `Pres ${index + 1}` }),
  );

  return ProductPresentationCollection.create(presentations);
}

// ---------------------------------------------------------------------------
// create / items
// ---------------------------------------------------------------------------

describe("ProductPresentationCollection.create", () => {
  it("creates a collection with the given items", () => {
    const collection = buildCollection();

    expect(collection.items).toHaveLength(2);
  });

  it("creates an empty collection", () => {
    const collection = ProductPresentationCollection.create([]);

    expect(collection.items).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// get
// ---------------------------------------------------------------------------

describe("ProductPresentationCollection.get", () => {
  it("returns the item when found", () => {
    const collection = buildCollection();
    const first = collection.items[0]!;

    expect(collection.get(first.id.toString())).not.toBeNull();
  });

  it("returns undefined when not found", () => {
    const collection = buildCollection();

    expect(collection.get(UUID.generate().toString())).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// add
// ---------------------------------------------------------------------------

describe("ProductPresentationCollection.add", () => {
  it("adds a presentation with unique fields", () => {
    const collection = buildCollection();
    const item = buildPresentation({ barcode: "789", name: "Nueva" });

    collection.add(item);

    expect(collection.items).toHaveLength(3);
  });

  it("throws ProductPresentationAlreadyExistsException when the id is duplicated", () => {
    const collection = buildCollection();
    const item = collection.items[0]!;

    expect(() => collection.add(item)).toThrow(
      ProductPresentationAlreadyExistsException,
    );
  });

  it("throws ProductPresentationAlreadyExistsException when the barcode is duplicated", () => {
    const collection = buildCollection({ barcodes: ["123", "456"] });
    const item = buildPresentation({ barcode: "123", name: "Otro" });

    expect(() => collection.add(item)).toThrow(
      ProductPresentationAlreadyExistsException,
    );
  });

  it("throws ProductPresentationAlreadyExistsException when the name is duplicated", () => {
    const collection = buildCollection({ barcodes: ["123", "456"] });
    const item = buildPresentation({ barcode: "789", name: "Pres 1" });

    expect(() => collection.add(item)).toThrow(
      ProductPresentationAlreadyExistsException,
    );
  });
});

// ---------------------------------------------------------------------------
// update
// ---------------------------------------------------------------------------

describe("ProductPresentationCollection.update", () => {
  it("replaces an existing item", () => {
    const collection = buildCollection();
    const existing = collection.items[0]!;
    const now = new Date();

    const updated = ProductPresentation.reconstitute({
      id: existing.id.toString(),
      productId: "00000000-0000-4000-8000-000000000001",
      name: "Cambiada",
      searchBlob: "agua cambiada 999",
      barcode: "999",
      conversionFactor: 24,
      pricePurchase: 800,
      priceSale: 1000,
      priceWholesale: 900,
      organizationId: "00000000-0000-4000-8000-000000000001",
      createdBy: "00000000-0000-4000-8000-000000000002",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    const returned = collection.update(updated);

    expect(returned).not.toBeNull();
    expect(collection.get(existing.id.toString())!.values.name).toBe("Cambiada");
  });

  it("throws ProductPresentationNotFoundException when the item does not exist", () => {
    const collection = buildCollection();
    const item = buildPresentation({ barcode: "999", name: "Nueva" });

    expect(() => collection.update(item)).toThrow(
      ProductPresentationNotFoundException,
    );
  });
});

// ---------------------------------------------------------------------------
// barcodes / checkBarcodes
// ---------------------------------------------------------------------------

describe("ProductPresentationCollection.barcodes", () => {
  it("returns only non-null barcodes", () => {
    const collection = buildCollection({ barcodes: ["123", null] });

    expect(collection.barcodes).toEqual(["123"]);
  });
});

describe("ProductPresentationCollection.checkBarcodes", () => {
  it("throws ProductPresentationNoHasBarcodeException when there are no barcodes", () => {
    const collection = buildCollection({ barcodes: [null, null] });

    expect(() => collection.checkBarcodes()).toThrow(
      ProductPresentationNoHasBarcodeException,
    );
  });

  it("throws DuplicatedBarcodeException when barcodes repeat", () => {
    const collection = buildCollection({ barcodes: ["123", "123"] });

    expect(() => collection.checkBarcodes()).toThrow(DuplicatedBarcodeException);
  });

  it("passes when barcodes are unique", () => {
    const collection = buildCollection({ barcodes: ["123", "456"] });

    expect(() => collection.checkBarcodes()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// delete / deleteMany
// ---------------------------------------------------------------------------

describe("ProductPresentationCollection.delete", () => {
  it("removes an existing item", () => {
    const collection = buildCollection();
    const first = collection.items[0]!;

    collection.delete(first.id.toString());

    expect(collection.items).toHaveLength(1);
  });

  it("throws ProductPresentationNotFoundException when the item does not exist", () => {
    const collection = buildCollection();

    expect(() => collection.delete(UUID.generate().toString())).toThrow(
      ProductPresentationNotFoundException,
    );
  });
});

describe("ProductPresentationCollection.deleteMany", () => {
  it("removes multiple items", () => {
    const collection = buildCollection();
    const ids = collection.items.map((item) => item.id.toString());

    collection.deleteMany(ids);

    expect(collection.items).toHaveLength(0);
  });
});