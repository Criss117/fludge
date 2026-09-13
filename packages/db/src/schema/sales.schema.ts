import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { createdByMetadata, organizationMetadata } from "./iam.schema";
import { auditMetadata } from "./shared";
import { paymentTypeEnum, saleStatusEnum } from "@fludge/utils/enums/db-enums";
import { customer } from "./customer.schema";
import { productPresentation } from "./catalog.schema";

export const sale = sqliteTable("sale", {
  id: text("id").primaryKey(),
  saleNumber: text("sale_number").notNull(),

  status: text("status", { enum: saleStatusEnum }).notNull(),
  paymentType: text("payment_type", { enum: paymentTypeEnum }).notNull(),

  customerId: text("customer_id").references(() => customer.id, {
    onDelete: "set null",
  }),

  completedAt: integer("completed_at", {
    mode: "timestamp_ms",
  }),
  cancelledAt: integer("cancelled_at", {
    mode: "timestamp_ms",
  }),
  total: integer("total").notNull(),

  cancelReason: text("cancel_reason"),
  notes: text("notes"),

  ...organizationMetadata,
  ...auditMetadata,
  ...createdByMetadata,
});

export const saleItem = sqliteTable("sale_item", {
  id: text("id").primaryKey(),
  saleId: text("sale_id")
    .notNull()
    .references(() => sale.id, {
      onDelete: "cascade",
    }),
  productPresentationId: text("product_presentation_id").references(
    () => productPresentation.id,
    {
      onDelete: "set null",
    },
  ),

  productPresentationName: text("product_presentation_name").notNull(),
  productPresentationPrice: integer("product_presentation_price").notNull(),
  quantity: integer("quantity").notNull(),
  subtotal: integer("subtotal").notNull(),

  ...organizationMetadata,
  ...auditMetadata,
});

export const saleSequences = sqliteTable(
  "sale_sequences",
  {
    year: integer("year").notNull(),
    currentValue: integer("current_value").notNull().default(0),
    ...organizationMetadata,
  },
  (table) => [primaryKey({ columns: [table.organizationId, table.year] })],
);

export type SaleSelect = typeof sale.$inferSelect;
export type SaleInsert = typeof sale.$inferInsert;

export type SaleItemSelect = typeof saleItem.$inferSelect;
export type SaleItemInsert = typeof saleItem.$inferInsert;

export type SaleSequenceSelect = typeof saleSequences.$inferSelect;
export type SaleSequenceInsert = typeof saleSequences.$inferInsert;
