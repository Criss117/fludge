import {
  blob,
  index,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import type { Permission } from "@fludge/utils/validators/permission.schemas";

import { auditMetadata, uuid } from "../utils";
import { user } from "./auth";

export const organization = sqliteTable(
  "organization",
  {
    id: uuid().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    metadata: blob("metadata"),
    legalName: text("legal_name").notNull().unique(),
    address: text("address").notNull(),
    contactPhone: text("contact_phone"),
    contactEmail: text("contact_email"),
    rootUserId: text("root_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    ...auditMetadata,
  },
  (table) => [
    uniqueIndex("organization_slug_uidx").on(table.slug),
    uniqueIndex("organization_legal_name_uidx").on(table.legalName),
  ],
);

export const team = sqliteTable(
  "team",
  {
    id: uuid().primaryKey(),
    name: text("name").notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    permissions: blob("permissions", { mode: "json" })
      .$type<Permission[]>()
      .notNull(),
    description: text("description"),

    ...auditMetadata,
  },
  (table) => [index("team_organization_id_idx").on(table.organizationId)],
);

export const teamMember = sqliteTable(
  "team_member",
  {
    teamId: text("team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    ...auditMetadata,
  },
  (table) => [
    primaryKey({ columns: [table.teamId, table.userId, table.organizationId] }),
  ],
);

export const member = sqliteTable(
  "member",
  {
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    ...auditMetadata,
  },
  (table) => [primaryKey({ columns: [table.organizationId, table.userId] })],
);

export type SelectOrganization = typeof organization.$inferSelect;
export type SelectTeam = typeof team.$inferSelect;
export type SelectTeamMember = typeof teamMember.$inferSelect;
export type SelectMember = typeof member.$inferSelect;

export type InsertOrganization = typeof organization.$inferInsert;
export type InsertTeam = typeof team.$inferInsert;
export type InsertTeamMember = typeof teamMember.$inferInsert;
export type InsertMember = typeof member.$inferInsert;
