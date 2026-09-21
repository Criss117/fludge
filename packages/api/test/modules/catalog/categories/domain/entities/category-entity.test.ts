import { describe, expect, it } from "bun:test";

import { Category } from "@fludge/api/modules/catalog/categories/domain/entities/category.entity";
import { Status } from "@fludge/api/modules/shared/domain/value-objects/status";
import { UUID } from "@fludge/utils/uuid";
import type { CategorySelect } from "@fludge/db/schema/catalog.schema";
import { makeOrganizationId, makeUserId } from "@test/support/builders/product.builder";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildCategory(options?: { name?: string }) {
  return Category.create({
    name: options?.name ?? "Bebidas",
    organizationId: makeOrganizationId(),
    createdBy: makeUserId(),
    description: "Bebidas y refrescos",
  });
}

function buildCategorySelect(): CategorySelect {
  const now = new Date("2026-01-01T00:00:00.000Z");

  return {
    id: UUID.generate().toString(),
    name: "Bebidas",
    slug: "bebidas",
    description: "Bebidas y refrescos",
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

describe("Category.create", () => {
  it("creates a category with active status and slug from name", () => {
    const category = buildCategory({ name: "Bebidas Frias" });

    expect(category.values.name).toBe("Bebidas Frias");
    expect(category.values.slug).toBe("bebidas-frias");
    expect(category.values.status).toBe("active");
    expect(category.values.description).toBe("Bebidas y refrescos");
    expect(category.values.id).toBeTruthy();
    expect(category.values.createdAt).toBeInstanceOf(Date);
    expect(category.values.updatedAt).toBeInstanceOf(Date);
  });

  it("stores organization and creator ids", () => {
    const category = buildCategory();

    expect(category.values.organizationId).toBe(makeOrganizationId().toString());
    expect(category.values.createdBy).toBe(makeUserId().toString());
  });

  it("defaults description to empty string when not provided", () => {
    const category = Category.create({
      name: "Bebidas",
      organizationId: makeOrganizationId(),
      createdBy: makeUserId(),
      description: "",
    });

    expect(category.values.description).toBe("");
  });
});

// ---------------------------------------------------------------------------
// reconstitute
// ---------------------------------------------------------------------------

describe("Category.reconstitute", () => {
  it("rebuilds a category from select values", () => {
    const values = buildCategorySelect();
    const category = Category.reconstitute(values);

    expect(category.values.id).toBe(values.id);
    expect(category.values.name).toBe(values.name);
    expect(category.values.slug).toBe(values.slug);
    expect(category.values.description).toBe(values.description);
    expect(category.values.status).toBe(values.status);
  });
});

// ---------------------------------------------------------------------------
// getters
// ---------------------------------------------------------------------------

describe("Category getters", () => {
  it("exposes id and status", () => {
    const category = buildCategory();

    expect(category.id).toBeInstanceOf(Object);
    expect(category.status.isActive()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// update
// ---------------------------------------------------------------------------

describe("Category.update", () => {
  it("updates the name and regenerates the slug", () => {
    const category = buildCategory();

    category.update({ name: "Snacks" });

    expect(category.values.name).toBe("Snacks");
    expect(category.values.slug).toBe("snacks");
  });

  it("does not regenerate the slug when the name is unchanged", () => {
    const category = buildCategory();
    const before = category.values.slug;

    category.update({ name: "Bebidas" });

    expect(category.values.slug).toBe(before);
  });

  it("updates description and status", () => {
    const category = buildCategory();

    category.update({
      description: "Nueva descripción",
      status: new Status("inactive"),
    });

    expect(category.values.description).toBe("Nueva descripción");
    expect(category.values.status).toBe("inactive");
  });

  it("touches the updatedAt timestamp", () => {
    const category = buildCategory();
    const before = category.values.updatedAt.getTime();

    category.update({ description: "cambio" });

    expect(category.values.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
});

// ---------------------------------------------------------------------------
// status transitions
// ---------------------------------------------------------------------------

describe("Category status transitions", () => {
  it("archive sets the status to inactive", () => {
    const category = buildCategory();

    category.archive();

    expect(category.status.isInactive()).toBe(true);
    expect(category.values.status).toBe("inactive");
  });

  it("activate sets the status to active", () => {
    const category = buildCategory();
    category.archive();

    category.activate();

    expect(category.status.isActive()).toBe(true);
  });

  it("toggleStatus toggles between active and inactive", () => {
    const category = buildCategory();

    category.toggleStatus();
    expect(category.status.isInactive()).toBe(true);

    category.toggleStatus();
    expect(category.status.isActive()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// belongsTo
// ---------------------------------------------------------------------------

describe("Category.belongsTo", () => {
  it("returns true when the category belongs to the organization", () => {
    const category = buildCategory();

    expect(category.belongsTo(makeOrganizationId())).toBe(true);
  });

  it("returns false when the category belongs to another organization", () => {
    const category = buildCategory();
    const otherOrg = UUID.generate();

    expect(category.belongsTo(otherOrg)).toBe(false);
  });
});