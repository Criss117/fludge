import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { createdByMetadata, organizationMetadata } from "./iam.schema";
import { auditMetadata, productStatus, status } from "./shared";
import { sql } from "drizzle-orm";

export const category = sqliteTable(
  "category",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),

    description: text("description"),

    status: status,

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

export const product = sqliteTable(
  "product",
  {
    id: text("id").primaryKey(),

    name: text("name").notNull(),
    slug: text("slug").notNull(),
    searchBlob: text("search_blob").notNull(),
    description: text("description"),

    categoryId: text("category_id").references(() => category.id),

    stock: integer("stock").notNull(),
    minStock: integer("min_stock").notNull(),

    allowNegativeStock: integer("allow_negative_stock", {
      mode: "boolean",
    })
      .notNull()
      .default(false),
    status: productStatus,

    ...createdByMetadata,
    ...organizationMetadata,
    ...auditMetadata,
  },
  (t) => [
    uniqueIndex("product_organization_slug_unique").on(
      t.organizationId,
      t.slug,
    ),

    // Índices
    index("product_organization_idx").on(t.organizationId),

    index("product_organization_search_blob_idx").on(
      t.organizationId,
      t.searchBlob,
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

    check("product_minimum_stock_check", sql`${t.minStock} >= 0`),

    check(
      "product_stock_quantity_check",
      sql`${t.allowNegativeStock} = true OR ${t.stock} >= 0`,
    ),
  ],
);

export const productPresentation = sqliteTable(
  "product_presentation",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, {
        onDelete: "cascade",
      }),

    name: text("name").notNull(),
    searchBlob: text("search_blob").notNull(),
    barcode: text("barcode"),

    conversionFactor: integer("conversion_factor").notNull(),

    priceSale: integer("price_sale").notNull(),
    pricePurchase: integer("price_purchase"),
    priceWholesale: integer("price_wholesale"),

    status: productStatus,

    ...createdByMetadata,
    ...organizationMetadata,
    ...auditMetadata,
  },
  (t) => [
    index("presentation_product_idx").on(t.productId),
    index("presentation_organization_idx").on(t.organizationId),
    index("presentation_name_idx").on(t.name),

    uniqueIndex("presentation_product_name_unique").on(t.productId, t.name),

    uniqueIndex("presentation_product_factor_unique").on(
      t.productId,
      t.conversionFactor,
    ),

    uniqueIndex("presentation_barcode_unique")
      .on(t.organizationId, t.barcode)
      .where(sql`${t.barcode} IS NOT NULL`),

    check(
      "presentation_conversion_factor_check",
      sql`${t.conversionFactor} >= 1`,
    ),

    check("presentation_price_retail_check", sql`${t.priceSale} >= 0`),

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

export type CategorySelect = typeof category.$inferSelect;
export type CategoryInsert = typeof category.$inferInsert;

export type ProductSelect = typeof product.$inferSelect;
export type ProductInsert = typeof product.$inferInsert;

export type ProductPresentationSelect = typeof productPresentation.$inferSelect;
export type ProductPresentationInsert = typeof productPresentation.$inferInsert;
