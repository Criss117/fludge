import {
  boolean,
  check,
  index,
  integer,
  numeric,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { auditMetadata } from "./shared";
import {
  createdByMetadata,
  organization,
  organizationMetadata,
} from "./auth.schema";
import {
  inventoryMovementReasonEnum,
  movementReferenceTypeEnum,
  movementTypeEnum,
  presentationStatusEnum,
  productStatusEnum,
} from "./enums.schema";

export const category = pgTable(
  "category",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: text("name").notNull(),
    slug: text("slug").notNull(),

    description: text("description"),

    ...createdByMetadata,
    ...organizationMetadata,
    ...auditMetadata,
  },
  (t) => [
    uniqueIndex("category_organization_name_unique").on(
      t.organizationId,
      t.name,
    ),
    uniqueIndex("category_organization_slug_unique").on(
      t.organizationId,
      t.slug,
    ),
    index("category_organization_idx").on(t.organizationId),
    index("category_name_idx").on(t.name),
    index("category_organization_name_idx").on(t.organizationId, t.name),
  ],
);

export const product = pgTable(
  "product",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),

    categoryId: uuid("category_id").references(() => category.id, {
      onDelete: "set null",
    }),

    barcode: text("barcode").notNull(),

    name: text("name").notNull(),
    searchName: text("search_name").notNull(),
    slug: text("slug").notNull(),

    description: text("description"),
    notes: text("notes"),
    imageUrl: text("image_url"),

    stockQuantity: integer("stock_quantity").notNull(),

    minimumStock: integer("minimum_stock"),

    allowNegativeStock: boolean("allow_negative_stock")
      .notNull()
      .default(false),

    status: productStatusEnum("status").notNull().default("active"),

    deletedReason: text("deleted_reason"),

    ...createdByMetadata,
    ...auditMetadata,
  },
  (t) => [
    // Unicidad por organización
    uniqueIndex("product_organization_barcode_unique").on(
      t.organizationId,
      t.barcode,
    ),

    uniqueIndex("product_organization_slug_unique").on(
      t.organizationId,
      t.slug,
    ),

    // Índices
    index("product_organization_idx").on(t.organizationId),

    index("product_organization_search_name_idx").on(
      t.organizationId,
      t.searchName,
    ),

    index("product_organization_category_idx").on(
      t.organizationId,
      t.categoryId,
    ),

    index("product_organization_status_idx").on(t.organizationId, t.status),

    index("product_organization_category_status_idx").on(
      t.organizationId,
      t.categoryId,
      t.status,
    ),

    check("product_minimum_stock_check", sql`${t.minimumStock} >= 0`),

    check(
      "product_stock_quantity_check",
      sql`${t.allowNegativeStock} = true OR ${t.stockQuantity} >= 0`,
    ),
  ],
);

export const productPresentation = pgTable(
  "product_presentation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),

    // Código de barras propio de la presentación (opcional)
    barcode: text("barcode"),
    imageUrl: text("image_url"),

    // Nombre de la unidad para mostrar al usuario
    // Ej: unidad, caja, six pack, display
    unitLabel: text("unit_label").notNull(),
    // Cantidad de unidades base que contiene
    // 1 = unidad
    // 6 = six pack
    // 24 = caja
    conversionFactor: integer("conversion_factor").notNull(),

    priceRetail: numeric("price_retail", {
      precision: 12,
      scale: 2,
    }).notNull(),

    pricePurchase: numeric("price_purchase", {
      precision: 12,
      scale: 2,
    }),

    priceWholesale: numeric("price_wholesale", {
      precision: 12,
      scale: 2,
    }),

    status: presentationStatusEnum("status").notNull().default("active"),

    deletedReason: text("deleted_reason"),

    ...createdByMetadata,
    ...organizationMetadata,
    ...auditMetadata,
  },
  (t) => [
    index("presentation_product_idx").on(t.productId),
    index("presentation_name_idx").on(t.name),
    index("presentation_status_idx").on(t.status),

    uniqueIndex("presentation_product_name_unique").on(t.productId, t.name),

    uniqueIndex("presentation_product_factor_unique").on(
      t.productId,
      t.conversionFactor,
    ),

    uniqueIndex("presentation_barcode_unique")
      .on(t.barcode)
      .where(sql`${t.barcode} IS NOT NULL`),

    check(
      "presentation_conversion_factor_check",
      sql`${t.conversionFactor} >= 1`,
    ),

    check("presentation_price_retail_check", sql`${t.priceRetail} >= 0`),

    check(
      "presentation_price_purchase_check",
      sql`${t.pricePurchase} IS NULL OR ${t.pricePurchase} >= 0`,
    ),

    check(
      "presentation_price_wholesale_check",
      sql`${t.priceWholesale} IS NULL OR ${t.priceWholesale} >= 0`,
    ),
  ],
);

export const inventoryMovement = pgTable(
  "inventory_movement",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, {
        onDelete: "restrict",
      }),

    presentationId: uuid("presentation_id").references(
      () => productPresentation.id,
      {
        onDelete: "set null",
      },
    ),

    type: movementTypeEnum("type").notNull(),

    // Cantidad de unidades base (+ entrada / - salida)
    quantity: integer("quantity").notNull(),

    // Cantidad de presentaciones utilizadas
    // Ej: 3 cajas
    presentationQuantity: integer("presentation_quantity"),

    // Factor utilizado al momento del movimiento
    // Permite reconstruir el histórico aunque la presentación cambie.
    conversionFactor: integer("conversion_factor"),

    stockBefore: integer("stock_before").notNull(),
    stockAfter: integer("stock_after").notNull(),

    referenceId: uuid("reference_id"),
    referenceType: movementReferenceTypeEnum("reference_type"),

    reason: inventoryMovementReasonEnum("reason").notNull(),

    notes: text("notes"),

    ...createdByMetadata,
    ...organizationMetadata,
    createdAt: auditMetadata.createdAt,
  },
  (t) => [
    // Índices principales
    index("inventory_organization_idx").on(t.organizationId),

    index("inventory_organization_created_idx").on(
      t.organizationId,
      t.createdAt,
    ),

    index("inventory_organization_product_idx").on(
      t.organizationId,
      t.productId,
    ),

    index("inventory_organization_presentation_idx").on(
      t.organizationId,
      t.presentationId,
    ),

    index("inventory_organization_reference_idx").on(
      t.organizationId,
      t.referenceType,
      t.referenceId,
    ),

    // Validaciones
    check("inventory_quantity_check", sql`${t.quantity} != 0`),

    check(
      "inventory_stock_check",
      sql`${t.stockAfter} = ${t.stockBefore} + ${t.quantity}`,
    ),

    check(
      "inventory_conversion_factor_check",
      sql`${t.conversionFactor} IS NULL OR ${t.conversionFactor} >= 1`,
    ),
  ],
);

export type CategoryInsert = typeof category.$inferInsert;
export type CategorySelect = typeof category.$inferSelect;

export type ProductInsert = typeof product.$inferInsert;
export type ProductSelect = typeof product.$inferSelect;

export type ProductPresentationInsert = typeof productPresentation.$inferInsert;
export type ProductPresentationSelect = typeof productPresentation.$inferSelect;

export type InventoryMovementInsert = typeof inventoryMovement.$inferInsert;
export type InventoryMovementSelect = typeof inventoryMovement.$inferSelect;
