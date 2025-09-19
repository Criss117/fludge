import { text } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import { v4 } from "uuid";
import { auditMetadata } from "../helpers/audit-metadata";

export const providers = sqliteTable("providers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  name: text("name", {
    length: 100,
  }).notNull(),
  nit: text("nit", {
    length: 20,
  }).notNull(),
  phone: text("phone", {
    length: 20,
  }).notNull(),
  email: text("email", {
    length: 255,
  }),
  principalContact: text("principal_contact", {
    length: 255,
  }),
  ...auditMetadata,
});

export type InsertProvider = typeof providers.$inferInsert;
export type SelectProvider = typeof providers.$inferSelect;
