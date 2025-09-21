import { v4 } from "uuid";
import { text } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import { auditMetadata } from "../helpers/audit-metadata";
import { foreignKey } from "drizzle-orm/sqlite-core";
import { business } from "./business.schema";

export const categories = sqliteTable(
  "categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => v4()),
    name: text("name", {
      length: 100,
    }).notNull(),
    description: text("description", {
      length: 255,
    }),
    businessId: text("business_id")
      .references(() => business.id)
      .notNull(),
    parentId: text("parent_id"),
    ...auditMetadata,
  },
  (t) => [
    foreignKey({
      columns: [t.parentId],
      foreignColumns: [t.id],
      name: "fk_categories_parent",
    }),
  ]
);

export type InsertCategory = typeof categories.$inferInsert;
export type SelectCategory = typeof categories.$inferSelect;
