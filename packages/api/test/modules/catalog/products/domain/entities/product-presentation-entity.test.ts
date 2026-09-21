import { describe, expect, it } from "bun:test";

import { ProductPresentation } from "@fludge/api/modules/catalog/products/domain/entities/product-presentation.entity";
import { UUID } from "@fludge/utils/uuid";
import type { ProductPresentationSelect } from "@fludge/db/schema/catalog.schema";
import { makeOrganizationId, makeUserId } from "@test/support/builders/product.builder";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildPresentation(options?: {
  barcode?: string | null;
  name?: string;
}) {
  return ProductPresentation.create({
    name: options?.name ?? "Caja",
    productName: "Agua",
    barcode: options?.barcode ?? "7501234567890",
    conversionFactor: 24,
    pricePurchase: 800,
    priceSale: 1000,
    priceWholesale: 900,
    organizationId: makeOrganizationId().toString(),
    createdBy: makeUserId().toString(),
  });
}

function buildPresentationSelect(): ProductPresentationSelect {
  const now = new Date("2026-01-01T00:00:00.000Z");

  return {
    id: UUID.generate().toString(),
    productId: UUID.generate().toString(),
    name: "Caja",
    searchBlob: "agua caja 7501234567890",
    barcode: "7501234567890",
    conversionFactor: 24,
    pricePurchase: 800,
    priceSale: 1000,
    priceWholesale: 900,
    organizationId: makeOrganizationId().toString(),
    createdBy: makeUserId().toString(),
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
}

// ---------------------------------------------------------------------------
// create
// ---------------------------------------------------------------------------

describe("ProductPresentation.create", () => {
  it("creates a presentation with active status and default prices", () => {
    const presentation = buildPresentation();

    expect(presentation.values.status).toBe("active");
    expect(presentation.values.barcode).toBe("7501234567890");
    expect(presentation.values.conversionFactor).toBe(24);
    expect(presentation.values.priceSale).toBe(1000);
    expect(presentation.values.pricePurchase).toBe(800);
    expect(presentation.values.priceWholesale).toBe(900);
    expect(presentation.values.id).toBeTruthy();
  });

  it("defaults barcode and optional prices to null", () => {
    const presentation = ProductPresentation.create({
      name: "Unidad",
      productName: "Agua",
      conversionFactor: 1,
      priceSale: 1000,
      organizationId: makeOrganizationId().toString(),
      createdBy: makeUserId().toString(),
    });

    expect(presentation.values.barcode).toBeNull();
    expect(presentation.values.pricePurchase).toBeNull();
    expect(presentation.values.priceWholesale).toBeNull();
  });

  it("builds the search blob from product name, presentation name and barcode", () => {
    const presentation = buildPresentation({ name: "Caja x24", barcode: "123" });

    expect(presentation.values.searchBlob).toContain("agua");
    expect(presentation.values.searchBlob).toContain("caja x24");
    expect(presentation.values.searchBlob).toContain("123");
  });
});

// ---------------------------------------------------------------------------
// reconstitute
// ---------------------------------------------------------------------------

describe("ProductPresentation.reconstitute", () => {
  it("rebuilds a presentation from select values", () => {
    const values = buildPresentationSelect();
    const presentation = ProductPresentation.reconstitute(values);

    expect(presentation.values.id).toBe(values.id);
    expect(presentation.values.name).toBe(values.name);
    expect(presentation.values.barcode).toBe(values.barcode);
    expect(presentation.values.conversionFactor).toBe(values.conversionFactor);
    expect(presentation.values.priceSale).toBe(values.priceSale);
    expect(presentation.values.status).toBe(values.status);
  });
});

// ---------------------------------------------------------------------------
// update
// ---------------------------------------------------------------------------

describe("ProductPresentation.update", () => {
  it("updates the name and keeps the search blob in sync", () => {
    const presentation = buildPresentation();

    presentation.update({
      name: "Caja x48",
      productName: "Agua",
      conversionFactor: 24,
      priceSale: 1000,
      status: "active",
    });

    expect(presentation.values.name).toBe("Caja x48");
    expect(presentation.values.searchBlob).toContain("caja x48");
  });

  it("updates barcode, conversion factor and prices", () => {
    const presentation = buildPresentation();

    presentation.update({
      name: "Caja",
      productName: "Agua",
      barcode: "999",
      conversionFactor: 48,
      pricePurchase: 900,
      priceSale: 1200,
      priceWholesale: 1000,
      status: "active",
    });

    expect(presentation.values.barcode).toBe("999");
    expect(presentation.values.conversionFactor).toBe(48);
    expect(presentation.values.pricePurchase).toBe(900);
    expect(presentation.values.priceSale).toBe(1200);
    expect(presentation.values.priceWholesale).toBe(1000);
  });

  it("updates the status", () => {
    const presentation = buildPresentation();

    presentation.update({
      name: "Caja",
      productName: "Agua",
      conversionFactor: 24,
      priceSale: 1000,
      status: "discontinued",
    });

    expect(presentation.values.status).toBe("discontinued");
  });

  it("touches the updatedAt timestamp", () => {
    const presentation = buildPresentation();
    const before = presentation.values.updatedAt.getTime();

    presentation.update({
      name: "Caja",
      productName: "Agua",
      conversionFactor: 24,
      priceSale: 1000,
      status: "active",
    });

    expect(presentation.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
});

// ---------------------------------------------------------------------------
// valuesWithProductId
// ---------------------------------------------------------------------------

describe("ProductPresentation.valuesWithProductId", () => {
  it("includes the productId in the serialized values", () => {
    const presentation = buildPresentation();
    const productId = UUID.generate();

    const values = presentation.valuesWithProductId(productId);

    expect(values.productId).toBe(productId.toString());
    expect(values.id).toBe(presentation.id.toString());
  });
});

// ---------------------------------------------------------------------------
// previewUniqueFields / checkUniques / checkUniquesData
// ---------------------------------------------------------------------------

describe("ProductPresentation unique checks", () => {
  it("previewUniqueFields keeps current values when the same values are provided", () => {
    const presentation = buildPresentation({ barcode: "123", name: "Caja" });

    const preview = presentation.previewUniqueFields({ name: "Caja", barcode: "123" });

    expect(preview.name).toBe("Caja");
    expect(preview.barcode).toBe("123");
  });

  it("previewUniqueFields uses the provided values", () => {
    const presentation = buildPresentation({ barcode: "123", name: "Caja" });

    const preview = presentation.previewUniqueFields({ name: "Pack", barcode: "456" });

    expect(preview.name).toBe("Pack");
    expect(preview.barcode).toBe("456");
  });

  it("checkUniques returns true when the barcode matches", () => {
    const a = buildPresentation({ barcode: "123" });
    const b = buildPresentation({ barcode: "123", name: "Otro" });

    expect(a.checkUniques(b)).toBe(true);
  });

  it("checkUniques returns true when the name matches", () => {
    const a = buildPresentation({ name: "Caja" });
    const b = buildPresentation({ name: "Caja", barcode: "999" });

    expect(a.checkUniques(b)).toBe(true);
  });

  it("checkUniques returns false when nothing matches", () => {
    const a = buildPresentation({ name: "Caja", barcode: "123" });
    const b = buildPresentation({ name: "Pack", barcode: "999" });

    expect(a.checkUniques(b)).toBe(false);
  });

  it("checkUniquesData returns true when the name collides", () => {
    const presentation = buildPresentation({ name: "Caja" });

    expect(presentation.checkUniquesData({ name: "Caja", barcode: "999" })).toBe(true);
  });

  it("checkUniquesData returns true when the barcode collides", () => {
    const presentation = buildPresentation({ barcode: "123" });

    expect(presentation.checkUniquesData({ name: "Otro", barcode: "123" })).toBe(true);
  });

  it("checkUniquesData returns false when nothing collides", () => {
    const presentation = buildPresentation({ name: "Caja", barcode: "123" });

    expect(presentation.checkUniquesData({ name: "Pack", barcode: "456" })).toBe(false);
  });
});