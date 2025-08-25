import { text } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import { blob } from "drizzle-orm/sqlite-core";
import { v4 } from "uuid";
import type { Permission } from "@repo/core/value-objects/permission";

import { auditMetadata } from "../helpers/audit-metadata";
import { business } from "./business.schema";
import { users } from "./users.schema";
import { primaryKey } from "drizzle-orm/sqlite-core";

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
  permissions: blob("permissions", {
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

export const groupUsers = sqliteTable(
  "group_users",
  {
    groupId: text("group_id", {
      length: 255,
    })
      .references(() => groups.id)
      .notNull(),
    userId: text("user_id", {
      length: 255,
    })
      .references(() => users.id)
      .notNull(),
    ...auditMetadata,
  },
  (t) => [
    primaryKey({
      columns: [t.groupId, t.userId],
      name: "group_users_pk",
    }),
  ]
);

export type InsertGroup = typeof groups.$inferInsert;
export type SelectGroup = typeof groups.$inferSelect;

export type InsertGroupUser = typeof groupUsers.$inferInsert;
export type SelectGroupUser = typeof groupUsers.$inferSelect;
