import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";
import { roleEnum } from "@fludge/utils/enums/db-enums";
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

    metadata: text("metadata", { mode: "json" }).$type<
      Record<string, unknown>
    >(),

    legalName: text("legal_name").notNull(),
    taxId: text("tax_id").notNull(),
    address: text("address").notNull(),
    phone: text("phone").notNull(),

    ...auditMetadata,
  },
  (table) => [
    uniqueIndex("organization_name_unique").on(table.name),
    uniqueIndex("organization_slug_unique").on(table.slug),
    uniqueIndex("organization_legal_name_unique").on(table.legalName),
    uniqueIndex("organization_tax_id_unique").on(table.taxId),
  ],
);

export function organizationId() {
  return text("organization_id")
    .notNull()
    .references(() => organization.id, {
      onDelete: "cascade",
    });
}

export const member = sqliteTable(
  "member",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    role: text("role", { enum: roleEnum }).notNull(),

    assignedBy: text("assigned_by").references(
      (): AnySQLiteColumn => member.id,
      {
        onDelete: "set null",
      },
    ),

    organizationId: organizationId(),

    ...auditMetadata,
  },
  (table) => [
    uniqueIndex("member_organization_user_unique").on(
      table.organizationId,
      table.userId,
    ),

    index("member_organization_assignedBy_idx").on(
      table.organizationId,
      table.assignedBy,
    ),
  ],
);

export function memberId(name = "created_by") {
  return text(name)
    .references(() => member.id)
    .notNull();
}

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

    organizationId: organizationId(),
    createdBy: memberId(),
    ...auditMetadata,
  },
  (t) => [
    index("group_slug_idx").on(t.slug),
    index("group_name_idx").on(t.name),

    uniqueIndex("group_organization_id_slug_unique").on(
      t.organizationId,
      t.slug,
    ),
    uniqueIndex("group_organization_id_name_unique").on(
      t.organizationId,
      t.name,
    ),
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

    organizationId: organizationId(),

    createdBy: memberId(),
    createdAt: auditMetadata.createdAt,
  },
  (t) => [
    primaryKey({
      columns: [t.groupId, t.memberId],
    }),
  ],
);

export type UserSelect = typeof user.$inferSelect;
export type UserInsert = typeof user.$inferInsert;

export type GroupSelect = typeof group.$inferSelect;
export type GroupInsert = typeof group.$inferInsert;

export type GroupMemberSelect = typeof groupMember.$inferSelect;
export type GroupMemberInsert = typeof groupMember.$inferInsert;

export type OrganizationSelect = typeof organization.$inferSelect;
export type OrganizationInsert = typeof organization.$inferInsert;

export type MemberSelect = typeof member.$inferSelect;
export type MemberInsert = typeof member.$inferInsert;
