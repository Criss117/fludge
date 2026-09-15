import {
  check,
  foreignKey,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { member, memberId, organizationId } from "./iam.schema";
import { sql } from "drizzle-orm";
import { auditMetadata, productStatus } from "../shared";
import { type ProductPresentationSelect } from "../schema";

export const category = sqliteTable(
  "category",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),

    description: text("description").notNull(),

    createdBy: memberId(),
    organizationId: organizationId(),
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
    index("category_name_idx").on(t.name),
    foreignKey({
      columns: [t.createdBy, t.organizationId],
      foreignColumns: [member.id, member.organizationId],
    }),
  ],
);
export const product = sqliteTable(
  "product",
  {
    id: text("id").primaryKey(),

    name: text("name").notNull(),
    slug: text("slug").notNull(),
    searchBlob: text("search_blob").notNull(),
    description: text("description").notNull(),

    categoryId: text("category_id").references(() => category.id, {
      onDelete: "set null",
    }),

    stock: integer("stock").notNull(),
    minStock: integer("min_stock").notNull(),

    allowNegativeStock: integer("allow_negative_stock", {
      mode: "boolean",
    })
      .notNull()
      .default(false),

    createdBy: memberId(),
    organizationId: organizationId(),
    createdAt: auditMetadata.createdAt,
    updatedAt: auditMetadata.updatedAt,
    status: productStatus,

    presentations: text("presentations", { mode: "json" })
      .$type<ProductPresentationSelect[]>()
      .notNull(),
  },
  (t) => [
    uniqueIndex("product_organization_slug_unique").on(
      t.organizationId,
      t.slug,
    ),

    // Índices
    index("product_organization_idx").on(t.organizationId),

    index("product_organization_search_blob_idx").on(
      t.organizationId,
      t.searchBlob,
    ),

    index("product_organization_category_idx").on(
      t.organizationId,
      t.categoryId,
    ),

    index("product_organization_status_idx").on(t.organizationId, t.status),

    index("product_organization_category_status_idx").on(
      t.organizationId,
      t.categoryId,
      t.status,
    ),

    check("product_minimum_stock_check", sql`${t.minStock} >= 0`),

    check(
      "product_stock_quantity_check",
      sql`${t.allowNegativeStock} = true OR ${t.stock} >= 0`,
    ),
  ],
);

export type CategorySelect = typeof category.$inferSelect;
export type CategoryInsert = typeof category.$inferInsert;

export type ProductSelect = typeof product.$inferSelect;
export type ProductInsert = typeof product.$inferInsert;
