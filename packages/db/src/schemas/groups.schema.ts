import { v4 } from "uuid";
import { text } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import type { Permission } from "@repo/core/value-objects/permission";

import { auditMetadata } from "../helpers/audit-metadata";
import { business } from "./business.schema";

export const groups = sqliteTable("groups", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  name: text("name", {
    length: 255,
  }).notNull(),
  description: text("description", {
    length: 255,
  }),
  permissions: text("permissions", {
    mode: "json",
  })
    .notNull()
    .$type<Permission[]>(),
  businessId: text("business_id", {
    length: 255,
  })
    .references(() => business.id)
    .notNull(),
  ...auditMetadata,
});

export type InsertGroup = typeof groups.$inferInsert;
export type SelectGroup = typeof groups.$inferSelect;
