import { v4 } from "uuid";
import { text } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import { auditMetadata } from "../helpers/audit-metadata";
import { business } from "./business.schema";

export const brands = sqliteTable("brands", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  name: text("name", {
    length: 100,
  }).notNull(),
  description: text("description", {
    length: 255,
  }),
  businessId: text("business_id").references(() => business.id),

  ...auditMetadata,
});

export type InsertBrand = typeof brands.$inferInsert;
export type SelectBrand = typeof brands.$inferSelect;
