import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { auditMetadata } from "./audit-metadata";
import { member, organization } from "./auth.schema";

// -------------------------------------------------------------
// ENUMS
// -------------------------------------------------------------

export const productStatusEnum = pgEnum("product_status", [
  "active",
  "inactive",
  "discontinued",
]);

export const movementTypeEnum = pgEnum("movement_type", [
  "stock_in",
  "stock_out",
  "adjustment",
  "return",
]);

export const supplierStatusEnum = pgEnum("supplier_status", [
  "active",
  "inactive",
]);

// -------------------------------------------------------------
// CATEGORY
// Supports two fixed levels via parent_id:
//   parent_id = null  → root category
//   parent_id = uuid  → subcategory
// App layer enforces max 2 levels — no grandchildren allowed
// -------------------------------------------------------------

export const category = pgTable(
  "category",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id").references((): any => category.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdBy: text("created_by").references(() => member.id, {
      onDelete: "set null",
    }),
    ...auditMetadata,
  },
  (t) => [
    index("category_organization_id_idx").on(t.organizationId),
    index("category_parent_id_idx").on(t.parentId),
    // slug unique per org
    unique("category_organization_id_slug_unique").on(t.organizationId, t.slug),
    // name unique per parent within org
    // same name allowed under different parent categories
    unique("category_organization_id_parent_id_name_unique").on(
      t.organizationId,
      t.parentId,
      t.name,
    ),
  ],
);

// -------------------------------------------------------------
// PRODUCT
// stock_quantity is denormalized current state.
// Every stock change must also write an inventory_movement
// in the same transaction — never update stock_quantity alone.
//
// price_purchase: operational cost price for margins and reports
// price_retail:   standard selling price
// price_wholesale: bulk price, selected manually by cashier
// -------------------------------------------------------------

export const product = pgTable(
  "product",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => category.id, {
      onDelete: "set null",
    }),

    // Identity
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    sku: text("sku"),
    barcode: text("barcode"),
    description: text("description"),
    imageUrl: text("image_url"),

    // Pricing
    priceRetail: numeric("price_retail", { precision: 12, scale: 2 }).notNull(),
    pricePurchase: numeric("price_purchase", {
      precision: 12,
      scale: 2,
    }).notNull(),
    priceWholesale: numeric("price_wholesale", {
      precision: 12,
      scale: 2,
    }).notNull(),

    // Stock
    stockQuantity: integer("stock_quantity").notNull().default(0),
    minimumStock: integer("minimum_stock").notNull().default(0),
    allowNegativeStock: boolean("allow_negative_stock")
      .notNull()
      .default(false),

    status: productStatusEnum("status").notNull().default("active"),

    createdBy: text("created_by").references(() => member.id, {
      onDelete: "set null",
    }),
    ...auditMetadata,
  },
  (t) => [
    index("product_organization_id_idx").on(t.organizationId),
    index("product_category_id_idx").on(t.categoryId),
    index("product_status_idx").on(t.organizationId, t.status),
    // name unique per org
    unique("product_organization_id_name_unique").on(t.organizationId, t.name),
    // slug unique per org
    unique("product_organization_id_slug_unique").on(t.organizationId, t.slug),
    // sku and barcode: nullable — Postgres does not consider NULLs
    // as duplicates in unique constraints, so products without
    // sku/barcode won't collide
    unique("product_organization_id_sku_unique").on(t.organizationId, t.sku),
    unique("product_organization_id_barcode_unique").on(
      t.organizationId,
      t.barcode,
    ),
  ],
);

// -------------------------------------------------------------
// INVENTORY MOVEMENT
// Immutable append-only ledger of all stock changes.
// Never update or delete — only insert.
// stock_before/after are snapshots for point-in-time reconstruction.
// -------------------------------------------------------------

export const inventoryMovement = pgTable(
  "inventory_movement",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "restrict" }),

    type: movementTypeEnum("type").notNull(),

    // Positive = stock added, negative = stock removed
    quantity: integer("quantity").notNull(),

    // Snapshots for history reconstruction
    stockBefore: integer("stock_before").notNull(),
    stockAfter: integer("stock_after").notNull(),

    // Optional link to originating entity
    referenceId: uuid("reference_id"),
    referenceType: text("reference_type"),

    reason: text("reason"),

    actorId: text("actor_id").references(() => member.id, {
      onDelete: "set null",
    }),

    // Immutable — only createdAt, no updatedAt or deletedAt
    createdAt: auditMetadata.createdAt,
  },
  (t) => [
    index("inventory_movement_organization_id_idx").on(t.organizationId),
    index("inventory_movement_product_id_idx").on(t.productId),
    index("inventory_movement_created_at_idx").on(t.createdAt),
    index("inventory_movement_reference_idx").on(
      t.referenceType,
      t.referenceId,
    ),
  ],
);

// -------------------------------------------------------------
// SUPPLIER
// Contact directory per organization.
// price_purchase on product is the operational cost.
// supplier_product.price is for comparison only.
// -------------------------------------------------------------

export const supplier = pgTable(
  "supplier",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),
    notes: text("notes"),
    status: supplierStatusEnum("status").notNull().default("active"),
    createdBy: text("created_by").references(() => member.id, {
      onDelete: "set null",
    }),
    ...auditMetadata,
  },
  (t) => [
    index("supplier_organization_id_idx").on(t.organizationId),
    index("supplier_status_idx").on(t.organizationId, t.status),
    unique("supplier_organization_id_name_unique").on(t.organizationId, t.name),
  ],
);

// -------------------------------------------------------------
// SUPPLIER PRODUCT
// Tracks which products a supplier provides and at what price.
// For price comparison only — not linked to inventory movements.
// No price history — updates overwrite the existing record.
// -------------------------------------------------------------

export const supplierProduct = pgTable(
  "supplier_product",
  {
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => supplier.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    notes: text("notes"),
    createdBy: text("created_by").references(() => member.id, {
      onDelete: "set null",
    }),
    ...auditMetadata,
  },
  (t) => [
    primaryKey({ columns: [t.supplierId, t.productId] }),
    index("supplier_product_product_id_idx").on(t.productId),
  ],
);

// -------------------------------------------------------------
// TYPES
// -------------------------------------------------------------

export type CategorySelect = typeof category.$inferSelect;
export type CategoryInsert = typeof category.$inferInsert;

export type ProductSelect = typeof product.$inferSelect;
export type ProductInsert = typeof product.$inferInsert;

export type InventoryMovementSelect = typeof inventoryMovement.$inferSelect;
export type InventoryMovementInsert = typeof inventoryMovement.$inferInsert;

export type SupplierSelect = typeof supplier.$inferSelect;
export type SupplierInsert = typeof supplier.$inferInsert;

export type SupplierProductSelect = typeof supplierProduct.$inferSelect;
export type SupplierProductInsert = typeof supplierProduct.$inferInsert;
