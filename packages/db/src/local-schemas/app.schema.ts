import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { auditMetadata } from "../shared";
import { sql } from "drizzle-orm";

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

export const AGGREGATE_ENUM = [
  "organizations",
  "groups",
  "members",
  "products",
  "categories",
  "sales",
  "customers",
] as const;

export type Aggregate = (typeof AGGREGATE_ENUM)[number];

export const syncState = sqliteTable("sync_state", {
  aggregate: text("aggregate", {
    enum: AGGREGATE_ENUM,
  }).primaryKey(),

  cursor: text("cursor", { mode: "json" }).$type<{
    updatedAt: Date;
    id: string;
  }>(),

  lastSyncedAt: integer("last_synced_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
});

export type AppSelect = typeof app.$inferSelect;
export type AppInsert = typeof app.$inferInsert;

export type SyncStateSelect = typeof syncState.$inferSelect;
export type SyncStateInsert = typeof syncState.$inferInsert;
