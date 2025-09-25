import { v4 } from "uuid";
import { integer, text } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import { index } from "drizzle-orm/sqlite-core";
import { auditMetadata } from "../helpers/audit-metadata";
import { categories } from "./categories.schema";
import { brands } from "./brands.schema";
import { business } from "./business.schema";

export const products = sqliteTable(
  "products",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => v4()),
    barcode: text("barcode", {
      length: 255,
    }).notNull(),
    name: text("name", {
      length: 255,
    }).notNull(),
    description: text("description", {
      length: 255,
    }),
    categoryId: text("category_id").references(() => categories.id),
    brandId: text("brand_id").references(() => brands.id),
    businessId: text("business_id")
      .references(() => business.id)
      .notNull(),

    // price and sale
    purchasePrice: integer("purchase_price").notNull(),
    salePrice: integer("sale_price").notNull(),
    wholesalePrice: integer("wholesale_price").notNull(),
    offerPrice: integer("offer_price").notNull(),

    // stock control
    currentStock: integer("current_stock").notNull(),
    minStock: integer("min_stock").notNull(),
    maxStock: integer("max_stock").notNull(),
    allowsNegativeInventory: integer("allows_negative_inventory", {
      mode: "boolean",
    })
      .notNull()
      .default(false),

    // additional info
    weight: integer("weight"),
    imageUrl: text("image_url", {
      length: 255,
    }),
    ...auditMetadata,
  },
  (t) => [
    index("idx_products_barcode").on(t.barcode),
    index("idx_products_name").on(t.name),
    index("idx_products_category_id").on(t.categoryId),
    index("idx_products_brand_id").on(t.brandId),
    index("idx_products_is_active").on(t.isActive),
  ]
);

export type InsertProduct = typeof products.$inferInsert;
export type SelectProduct = typeof products.$inferSelect;
