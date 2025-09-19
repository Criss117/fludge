import { v4 } from "uuid";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import { text } from "drizzle-orm/sqlite-core";
import { auditMetadata } from "../helpers/audit-metadata";
import { products } from "./products.schema";
import { providers } from "./providers.schema";
import { integer } from "drizzle-orm/sqlite-core";

export const productsProviders = sqliteTable("products_providers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  productId: text("product_id")
    .references(() => products.id)
    .notNull(),
  providerId: text("provider")
    .references(() => providers.id)
    .notNull(),
  providerCode: text("provider_code", {
    length: 255,
  }),
  providerPrice: integer("provider_price").notNull(),
  ...auditMetadata,
});

export type InsertProductProvider = typeof productsProviders.$inferInsert;
export type SelectProductProvider = typeof productsProviders.$inferSelect;
