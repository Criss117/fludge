import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
  uniqueIndex,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";
import { statusEnum, roleEnum } from "@fludge/utils/enums/db-enums";
import type { Permission } from "@fludge/utils/permissions/data";

import { sql } from "drizzle-orm";
import { auditMetadata } from "../shared";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  isRoot: integer("is_root", { mode: "boolean" }).notNull(),
  phone: text("phone").notNull(),
});

export const organization = sqliteTable(
  "organization",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    logo: text("logo"),
    metadata: text("metadata", { mode: "json" }).$type<string>(),
    legalName: text("legal_name").notNull(),
    taxId: text("tax_id").notNull(),
    address: text("address").notNull(),
    phone: text("phone").notNull(),
    status: text("status", { enum: statusEnum }).notNull().default("active"),

    ...auditMetadata,
  },
  (table) => [
    uniqueIndex("organization_slug_unique").on(table.slug),
    uniqueIndex("organization_legal_name_unique").on(table.legalName),
    uniqueIndex("organization_tax_id_unique").on(table.taxId),
    uniqueIndex("organization_phone_unique").on(table.phone),
    index("organization_name_idx").on(table.name),
  ],
);

export const organizationMetadata = {
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, {
      onDelete: "cascade",
    }),
};

export const member = sqliteTable(
  "member",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role", { enum: roleEnum }).notNull(),
    assignedBy: text("assigned_by").references(
      (): AnySQLiteColumn => member.id,
      {
        onDelete: "set null",
      },
    ),

    status: text("status", { enum: statusEnum }).notNull().default("active"),

    createdAt: auditMetadata.createdAt,

    ...organizationMetadata,
  },
  (table) => [
    uniqueIndex("member_organizationId_userId_unique").on(
      table.organizationId,
      table.userId,
    ),
    index("member_organizationId_idx").on(table.organizationId),
    index("member_userId_idx").on(table.userId),
  ],
);

export const createdByMetadata = {
  createdBy: text("created_by")
    .references(() => member.id)
    .notNull(),
};

export const group = sqliteTable(
  "group",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull(),
    permissions: text("permissions", { mode: "json" })
      .notNull()
      .$type<Permission[]>(),

    status: text("status", { enum: statusEnum }).notNull().default("active"),

    ...createdByMetadata,
    ...organizationMetadata,
    ...auditMetadata,
  },
  (t) => [
    index("group_organization_id_idx").on(t.organizationId),
    index("group_slug_idx").on(t.slug),

    unique("group_organization_id_slug_unique").on(t.organizationId, t.slug),
    unique("group_organization_id_name_unique").on(t.organizationId, t.name),
  ],
);

export const groupMember = sqliteTable(
  "group_member",
  {
    groupId: text("group_id")
      .notNull()
      .references(() => group.id, {
        onDelete: "cascade",
      }),
    memberId: text("member_id")
      .notNull()
      .references(() => member.id, {
        onDelete: "cascade",
      }),

    ...createdByMetadata,
    ...organizationMetadata,

    createdAt: auditMetadata.createdAt,
  },
  (t) => [
    primaryKey({
      columns: [t.groupId, t.memberId],
    }),
    index("group_member_group_id_member_id_idx").on(t.groupId, t.memberId),
  ],
);

export type GroupSelect = typeof group.$inferSelect;
export type GroupInsert = typeof group.$inferInsert;

export type GroupMemberSelect = typeof groupMember.$inferSelect;
export type GroupMemberInsert = typeof groupMember.$inferInsert;

export type OrganizationSelect = typeof organization.$inferSelect;
export type OrganizationInsert = typeof organization.$inferInsert;

export type MemberSelect = typeof member.$inferSelect;
export type MemberInsert = typeof member.$inferInsert;
