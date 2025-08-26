import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v4 } from "uuid";
import { auditMetadata } from "../helpers/audit-metadata";
import { index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => v4()),
    firstName: text("first_name", {
      length: 255,
    }).notNull(),
    lastName: text("last_name", {
      length: 255,
    }).notNull(),
    email: text("email", {
      length: 255,
    }).unique(),
    username: text("username", {
      length: 255,
    })
      .notNull()
      .unique(),
    password: text("password", {
      length: 255,
    }).notNull(),
    isRoot: int("is_root", {
      mode: "boolean",
    }).notNull(),
    isAccountValidated: int("is_account_validated", {
      mode: "boolean",
    })
      .default(false)
      .notNull(),

    ...auditMetadata,
  },
  (t) => [
    index("idx_users_email").on(t.email),
    index("idx_users_username").on(t.username),
    index("idx_users_first_name").on(t.firstName),
    index("idx_users_last_name").on(t.lastName),
  ]
);

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
