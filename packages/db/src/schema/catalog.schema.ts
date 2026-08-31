import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createdByMetadata, organizationMetadata } from "./iam.schema";
import { auditMetadata, status } from "./shared";

export const category = sqliteTable(
  "category",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),

    description: text("description"),

    status: status,

    ...createdByMetadata,
    ...organizationMetadata,
    ...auditMetadata,
  },
  (t) => [
    uniqueIndex("category_organization_name_unique").on(
      t.organizationId,
      t.name,
    ),
    uniqueIndex("category_organization_slug_unique").on(
      t.organizationId,
      t.slug,
    ),
    index("category_organization_idx").on(t.organizationId),
    index("category_name_idx").on(t.name),
    index("category_organization_name_idx").on(t.organizationId, t.name),
  ],
);

export type CategorySelect = typeof category.$inferSelect;
export type CategoryInsert = typeof category.$inferInsert;
