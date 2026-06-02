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
import { user } from "./auth.schema";
import { actionEnum, permissionsEnum, statusEnum } from "./shared.schema";

export const organization = pgTable(
  "organization",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    legalName: text("legal_name").notNull().unique(),
    taxId: text("tax_id").notNull().unique(),
    address: text("address").notNull(),
    phone: text("phone").notNull().unique(),

    status: statusEnum("status").notNull().default("active"),

    createdAt: auditMetadata.createdAt,
    updatedAt: auditMetadata.updatedAt,
  },
  (t) => [
    index("organization_owner_id_idx").on(t.ownerId),
    index("organization_slug_idx").on(t.slug),
    index("organization_legal_name_idx").on(t.legalName),
  ],
);

export const organizationHistory = pgTable("organization_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, {
      onDelete: "cascade",
    }),

  action: actionEnum("action").notNull(),
  description: text("description"),

  before: jsonb("before").notNull().$type<typeof organization.$inferSelect>(),
  after: jsonb("after").notNull().$type<typeof organization.$inferSelect>(),

  createdAt: auditMetadata.createdAt,
  updatedAt: auditMetadata.updatedAt,
});

export const member = pgTable(
  "member",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    assignedBy: text("assigned_by").references(() => user.id, {
      onDelete: "set null",
    }),

    status: statusEnum("status").notNull().default("active"),

    createdAt: auditMetadata.createdAt,
    updatedAt: auditMetadata.updatedAt,
  },
  (t) => [
    index("member_organization_id_user_id_idx").on(t.organizationId, t.userId),

    unique("member_organization_id_user_id_unique").on(
      t.organizationId,
      t.userId,
    ),
  ],
);

export const group = pgTable(
  "group",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    permissions: permissionsEnum("permissions").array().notNull(),

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
    memberId: uuid("member_id")
      .notNull()
      .references(() => member.id, {
        onDelete: "cascade",
      }),

    assignedBy: text("assigned_by").references(() => user.id, {
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

export type OrganizationSelect = typeof organization.$inferSelect;
export type OrganizationInsert = typeof organization.$inferInsert;

export type OrganizationHistorySelect = typeof organizationHistory.$inferSelect;
export type OrganizationHistoryInsert = typeof organizationHistory.$inferInsert;

export type MemberSelect = typeof member.$inferSelect;
export type MemberInsert = typeof member.$inferInsert;

export type GroupSelect = typeof group.$inferSelect;
export type GroupInsert = typeof group.$inferInsert;

export type GroupHistorySelect = typeof groupHistory.$inferSelect;
export type GroupHistoryInsert = typeof groupHistory.$inferInsert;

export type GroupMemberSelect = typeof groupMember.$inferSelect;
export type GroupMemberInsert = typeof groupMember.$inferInsert;
