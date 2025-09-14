import { primaryKey, text } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import { index } from "drizzle-orm/sqlite-core";
import { business } from "./business.schema";
import { auditMetadata } from "../helpers/audit-metadata";
import { users } from "./users.schema";

export const employees = sqliteTable(
  "employees",
  {
    businessId: text("business_id")
      .references(() => business.id)
      .notNull(),
    userId: text("user_id")
      .references(() => users.id)
      .notNull(),
    groupIds: text("group_ids", {
      mode: "json",
    })
      .notNull()
      .$type<string[]>(),
    ...auditMetadata,
  },
  (t) => [
    index("idx_employees_business_id").on(t.businessId),
    index("idx_employees_user_id").on(t.userId),
    primaryKey({
      columns: [t.businessId, t.userId],
      name: "pk_employees",
    }),
  ]
);

export type InsertEmployee = typeof employees.$inferInsert;
export type SelectEmployee = typeof employees.$inferSelect;
