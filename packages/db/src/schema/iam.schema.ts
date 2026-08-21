import {
  index,
  primaryKey,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";
import { auditMetadata } from "./shared";
import {
  createdByMetadata,
  member,
  organizationMetadata,
  type OrganizationSelect,
} from "./auth.schema";
import { actionEnum } from "./enums.schema";
import type { AppStatement } from "@fludge/utils/permissions";

export const organizationHistory = sqliteTable("organization_history", {
  id: text("id").primaryKey(),

  action: text("action", { enum: actionEnum }).notNull(),
  description: text("description"),

  before: text("before", { mode: "json" }).$type<OrganizationSelect>(),
  after: text("after", { mode: "json" }).$type<OrganizationSelect>(),

  actorId: text("actor_id").references(() => member.id, {
    onDelete: "set null",
  }),

  createdAt: auditMetadata.createdAt,
  ...organizationMetadata,
});

export const group = sqliteTable(
  "group",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    permissions: text("permissions", { mode: "json" })
      .notNull()
      .$type<AppStatement>(),

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

export const groupHistory = sqliteTable(
  "group_history",
  {
    id: text("id").primaryKey(),
    groupId: text("group_id")
      .notNull()
      .references(() => group.id, {
        onDelete: "cascade",
      }),

    action: text("action", { enum: actionEnum }).notNull(),
    description: text("description"),

    before: text("before", { mode: "json" }).$type<GroupSelect>(),
    after: text("after", { mode: "json" }).$type<GroupSelect>(),

    ...createdByMetadata,
    ...organizationMetadata,

    createdAt: auditMetadata.createdAt,
  },
  (t) => [index("group_history_group_id_idx").on(t.groupId)],
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

export type OrganizationHistorySelect = typeof organizationHistory.$inferSelect;
export type OrganizationHistoryInsert = typeof organizationHistory.$inferInsert;

export type GroupSelect = typeof group.$inferSelect;
export type GroupInsert = typeof group.$inferInsert;

export type GroupHistorySelect = typeof groupHistory.$inferSelect;
export type GroupHistoryInsert = typeof groupHistory.$inferInsert;

export type GroupMemberSelect = typeof groupMember.$inferSelect;
export type GroupMemberInsert = typeof groupMember.$inferInsert;
