import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { auditMetadata } from "../shared";

export const APP_ID = "app";

export const app = sqliteTable("app", {
  id: text("id").primaryKey().default(APP_ID),
  theme: text("theme", {
    enum: ["light", "dark"],
  })
    .notNull()
    .default("light"),
  loggedUserId: text("logged_user_id"),
  lastLoggedUserId: text("last_logged_user_id"),
  activeOrganizationId: text("active_organization_id"),
  updatedAt: auditMetadata.updatedAt,
  createdAt: auditMetadata.createdAt,
});

export type AppSelect = typeof app.$inferSelect;
export type AppInsert = typeof app.$inferInsert;
