import { describe, expect, it } from "bun:test";

import { Product } from "@fludge/api/modules/catalog/products/domain/entities/product.entity";
import { ProductPresentationNoHasBarcodeException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-bresentation-no-has-barcode.exception";
import { DuplicatedBarcodeException } from "@fludge/api/modules/catalog/products/domain/exceptions/duplicated-barcode.exception";
import { ProductPresentationAlreadyExistsException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-presentation-already-exists.exception";
import { buildProduct } from "@test/support/builders/product.builder";
import { UUID } from "@fludge/utils/uuid";
import type { ProductPresentationSelect, ProductSelect } from "@fludge/db/schema/catalog.schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildProductSelect(): ProductSelect & {
  presentations: ProductPresentationSelect[];
} {
  const now = new Date("2026-01-01T00:00:00.000Z");
  const presentationId = UUID.generate().toString();

  return {
    id: UUID.generate().toString(),
    organizationId: "00000000-0000-4000-8000-000000000001",
    categoryId: null,
    name: "Agua",
    searchBlob: "agua 7501234567890",
    slug: "agua",
    description: "Botella de agua 500ml",
    stock: 100,
    minStock: 10,
    allowNegativeStock: false,
    status: "active",
    createdBy: "00000000-0000-4000-8000-000000000002",
    createdAt: now,
    updatedAt: now,
    presentations: [
      {
        id: presentationId,
        productId: "00000000-0000-4000-8000-000000000001",
        name: "Caja",
        searchBlob: "agua caja 7501234567890",
        barcode: "7501234567890",
        conversionFactor: 24,
        pricePurchase: 800,
        priceSale: 1000,
        priceWholesale: 900,
        organizationId: "00000000-0000-4000-8000-000000000001",
        createdBy: "00000000-0000-4000-8000-000000000002",
        status: "active",
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// create
// ---------------------------------------------------------------------------

describe("Product.create", () => {
  it("creates a product with active status, slug and stock", () => {
    const product = buildProduct();

    expect(product.values.name).toBe("Agua");
    expect(product.values.slug).toBe("agua");
    expect(product.values.status).toBe("active");
    expect(product.values.stock).toBe(100);
    expect(product.values.minStock).toBe(10);
    expect(product.values.allowNegativeStock).toBe(false);
    expect(product.values.id).toBeTruthy();
    expect(product.values.createdAt).toBeInstanceOf(Date);
  });

  it("creates the presentations collection", () => {
    const product = buildProduct();

    expect(product.presentations).toHaveLength(1);
    expect(product.values.presentations).toHaveLength(1);
  });

  it("builds the search blob from the name and barcodes", () => {
    const product = buildProduct({ name: "Agua Mineral", barcodes: ["123"] });

    expect(product.values.searchBlob).toContain("agua mineral");
    expect(product.values.searchBlob).toContain("123");
  });

  it("throws ProductPresentationNoHasBarcodeException when no presentation has a barcode", () => {
    expect(() => buildProduct({ barcodes: [null] })).toThrow(
      ProductPresentationNoHasBarcodeException,
    );
  });

  it("throws DuplicatedBarcodeException when barcodes repeat", () => {
    expect(() => buildProduct({ barcodes: ["123", "123"] })).toThrow(
      DuplicatedBarcodeException,
    );
  });

  it("sets categoryId to null when not provided", () => {
    const product = buildProduct();

    expect(product.values.categoryId).toBeNull();
  });

  it("stores the categoryId when provided", () => {
    const categoryId = UUID.generate().toString();
    const product = buildProduct({ categoryId });

    expect(product.values.categoryId).toBe(categoryId);
  });
});

// ---------------------------------------------------------------------------
// reconstitute
// ---------------------------------------------------------------------------

describe("Product.reconstitute", () => {
  it("rebuilds a product from select values", () => {
    const values = buildProductSelect();
    const product = Product.reconstitute(values);

    expect(product.values.id).toBe(values.id);
    expect(product.values.name).toBe(values.name);
    expect(product.values.slug).toBe(values.slug);
    expect(product.values.status).toBe(values.status);
    expect(product.values.stock).toBe(values.stock);
    expect(product.values.presentations).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// update
// ---------------------------------------------------------------------------

describe("Product.update", () => {
  it("updates the name and regenerates slug and search blob", () => {
    const product = buildProduct();

    product.update({ name: "Agua Sin Gas" });

    expect(product.values.name).toBe("Agua Sin Gas");
    expect(product.values.slug).toBe("agua-sin-gas");
    expect(product.values.searchBlob).toContain("agua sin gas");
  });

  it("updates description and status", () => {
    const product = buildProduct();

    product.update({ description: "Nueva descripción", status: "discontinued" });

    expect(product.values.description).toBe("Nueva descripción");
    expect(product.values.status).toBe("discontinued");
  });

  it("updates the stock fields", () => {
    const product = buildProduct();

    product.update({ stock: 200, minStock: 20 });

    expect(product.values.stock).toBe(200);
    expect(product.values.minStock).toBe(20);
  });

  it("clears categoryId when null is provided", () => {
    const categoryId = UUID.generate().toString();
    const product = buildProduct({ categoryId });

    product.update({ categoryId: null });

    expect(product.values.categoryId).toBeNull();
  });

  it("ignores an empty string categoryId (only null clears it)", () => {
    const categoryId = UUID.generate().toString();
    const product = buildProduct({ categoryId });

    product.update({ categoryId: "" });

    expect(product.values.categoryId).toBe(categoryId);
  });

  it("touches the updatedAt timestamp", () => {
    const product = buildProduct();
    const before = product.values.updatedAt.getTime();

    product.update({ description: "cambio" });

    expect(product.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
});

// ---------------------------------------------------------------------------
// savePresentations
// ---------------------------------------------------------------------------

describe("Product.savePresentations", () => {
  it("adds new presentations and rebuilds the search blob", () => {
    const product = buildProduct();

    product.savePresentations([
      {
        id: UUID.generate().toString(),
        name: "Pack x6",
        productName: "Agua",
        barcode: "999",
        conversionFactor: 6,
        pricePurchase: 1000,
        priceSale: 1200,
        priceWholesale: 1100,
        status: "active",
      },
    ]);

    expect(product.presentations).toHaveLength(2);
    expect(product.values.searchBlob).toContain("999");
  });

  it("updates an existing presentation", () => {
    const product = buildProduct();
    const existing = product.presentations[0]!;

    product.savePresentations([
      {
        id: existing.id.toString(),
        name: "Caja x48",
        productName: "Agua",
        barcode: existing.barcode,
        conversionFactor: 48,
        pricePurchase: 1000,
        priceSale: 1200,
        priceWholesale: 1100,
        status: "active",
      },
    ]);

    const updated = product.presentations.find(
      (p) => p.id.toString() === existing.id.toString(),
    )!;
    expect(updated.values.name).toBe("Caja x48");
    expect(updated.values.conversionFactor).toBe(48);
  });

  it("throws ProductPresentationAlreadyExistsException when a barcode collides", () => {
    const product = buildProduct();

    expect(() =>
      product.savePresentations([
        {
          id: UUID.generate().toString(),
          name: "Otro",
          productName: "Agua",
          barcode: "7501234567890",
          conversionFactor: 6,
          pricePurchase: 1000,
          priceSale: 1200,
          priceWholesale: 1100,
          status: "active",
        },
      ]),
    ).toThrow(ProductPresentationAlreadyExistsException);
  });
});

// ---------------------------------------------------------------------------
// deletePresentations
// ---------------------------------------------------------------------------

describe("Product.deletePresentations", () => {
  it("removes presentations by id", () => {
    const product = buildProduct();
    const first = product.presentations[0]!;

    product.deletePresentations([first.id.toString()]);

    expect(product.presentations).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// sale / refund
// ---------------------------------------------------------------------------

describe("Product.sale", () => {
  it("decreases stock by quantity times conversion factor", () => {
    const product = buildProduct({ stock: 100 });
    const presentation = product.presentations[0]!; // conversionFactor 24

    product.sale({ id: presentation.id.toString(), quantity: 2 });

    expect(product.values.stock).toBe(52); // 100 - (2 * 24)
  });

  it("throws InsufficientStockException when stock runs out", () => {
    const product = buildProduct({ stock: 10 });
    const presentation = product.presentations[0]!; // conversionFactor 24

    expect(() =>
      product.sale({ id: presentation.id.toString(), quantity: 1 }),
    ).toThrow("api_errors.catalog.products.insufficient_stock");
  });
});

describe("Product.refund", () => {
  it("increases stock by quantity times conversion factor", () => {
    const product = buildProduct({ stock: 52 });
    const presentation = product.presentations[0]!; // conversionFactor 24

    product.refund({
      presentationId: presentation.id.toString(),
      quantity: 2,
      conversionFactor: 24,
    });

    expect(product.values.stock).toBe(100); // 52 + (2 * 24)
  });
});

// ---------------------------------------------------------------------------
// values
// ---------------------------------------------------------------------------

describe("Product.values", () => {
  it("serializes presentations with the productId", () => {
    const product = buildProduct();

    const values = product.values;

    expect(values.presentations).toHaveLength(1);
    expect(values.presentations[0]!.productId).toBe(values.id);
  });

  it("exposes barcodes", () => {
    const product = buildProduct();

    expect(product.barcodes).toEqual(["7501234567890"]);
  });
});