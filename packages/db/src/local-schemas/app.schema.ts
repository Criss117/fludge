import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import { auditMetadata } from "../shared";

export const APP_ID = "app";

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
export type SyncCursor = { updatedAt: Date; id: string };

export type SyncState = Record<
  Aggregate,
  {
    cursor: SyncCursor | null;
    lastSyncedAt: Date;
  }
>;

export type SessionData = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
    isRoot: boolean;
  };
};

export const defaultSyncState = Object.fromEntries(
  AGGREGATE_ENUM.map((aggregate) => [
    aggregate,
    {
      cursor: null as SyncCursor | null,
      lastSyncedAt: new Date(),
    },
  ]),
) as SyncState;

export const app = sqliteTable("app", {
  id: text("id").primaryKey().default(APP_ID),

  theme: text("theme", {
    enum: ["light", "dark"],
  })
    .notNull()
    .default("light"),

  lastLoggedUserId: text("last_logged_user_id"),

  activeOrganizationId: text("active_organization_id"),

  syncState: text("sync_state", {
    mode: "json",
  })
    .notNull()
    .$type<SyncState>()
    .$defaultFn(() => defaultSyncState),

  session: text("session", {
    mode: "json",
  }).$type<SessionData>(),

  updatedAt: auditMetadata.updatedAt,
  createdAt: auditMetadata.createdAt,
});

export type AppSelect = typeof app.$inferSelect;
export type AppInsert = typeof app.$inferInsert;
