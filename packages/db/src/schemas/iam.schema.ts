import {
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { auditMetadata } from "./audit-metadata";
import { member, organization } from "./auth.schema";
import { actionEnum, permissionEnum } from "./shared.schema";

export const organizationHistory = pgTable("organization_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, {
      onDelete: "cascade",
    }),

  action: actionEnum("action").notNull(),
  description: text("description"),

  before: jsonb("before").notNull().$type<typeof organization.$inferSelect>(),
  after: jsonb("after").notNull().$type<typeof organization.$inferSelect>(),

  by: text("by").references(() => member.id, {
    onDelete: "set null",
  }),

  createdAt: auditMetadata.createdAt,
  updatedAt: auditMetadata.updatedAt,
});

export const group = pgTable(
  "group",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    permissions: permissionEnum("permissions").array().notNull(),

    createdBy: text("created_by").references(() => member.id, {
      onDelete: "set null",
    }),

    ...auditMetadata,
  },
  (t) => [
    index("group_organization_id_idx").on(t.organizationId),
    index("group_slug_idx").on(t.slug),

    unique("group_organization_id_slug_unique").on(t.organizationId, t.slug),
    unique("group_organization_id_name_unique").on(t.organizationId, t.name),
  ],
);

export const groupHistory = pgTable(
  "group_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => group.id, {
        onDelete: "cascade",
      }),

    action: actionEnum("action").notNull(),
    description: text("description"),

    before: jsonb("before").notNull().$type<typeof group.$inferSelect>(),
    after: jsonb("after").notNull().$type<typeof group.$inferSelect>(),

    by: text("by").references(() => member.id, {
      onDelete: "set null",
    }),

    createdAt: auditMetadata.createdAt,
    updatedAt: auditMetadata.updatedAt,
  },
  (t) => [index("group_history_group_id_idx").on(t.groupId)],
);

export const groupMember = pgTable(
  "group_member",
  {
    groupId: uuid("group_id")
      .notNull()
      .references(() => group.id, {
        onDelete: "cascade",
      }),
    memberId: text("member_id")
      .notNull()
      .references(() => member.id, {
        onDelete: "cascade",
      }),

    assignedBy: text("assigned_by").references(() => member.id, {
      onDelete: "set null",
    }),

    createdAt: auditMetadata.createdAt,
    updatedAt: auditMetadata.updatedAt,
  },
  (t) => [
    primaryKey({
      columns: [t.groupId, t.memberId],
    }),
    index("group_member_group_id_member_id_idx").on(t.groupId, t.memberId),
  ],
);

export type OrganizationHistorySelect = typeof organizationHistory.$inferSelect;
export type OrganizationHistoryInsert = typeof organizationHistory.$inferInsert;

export type GroupSelect = typeof group.$inferSelect;
export type GroupInsert = typeof group.$inferInsert;

export type GroupHistorySelect = typeof groupHistory.$inferSelect;
export type GroupHistoryInsert = typeof groupHistory.$inferInsert;

export type GroupMemberSelect = typeof groupMember.$inferSelect;
export type GroupMemberInsert = typeof groupMember.$inferInsert;
