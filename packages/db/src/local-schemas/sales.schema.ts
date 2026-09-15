import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { paymentTypeEnum, saleStatusEnum } from "@fludge/utils/enums/db-enums";
import { customer } from "./customer.schema";
import { auditMetadata } from "../shared";
import { memberId, organizationId } from "../schema";

export const sale = sqliteTable("sale", {
  id: text("id").primaryKey(),
  saleNumber: text("sale_number").notNull(),

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

  status: text("status", { enum: saleStatusEnum }).notNull(),
  organizationId: organizationId(),
  createdBy: memberId(),
  createdAt: auditMetadata.createdAt,
  updatedAt: auditMetadata.updatedAt,
});

export const saleItem = sqliteTable("sale_item", {
  id: text("id").primaryKey(),
  saleId: text("sale_id")
    .notNull()
    .references(() => sale.id, {
      onDelete: "cascade",
    }),
  productPresentationId: text("product_presentation_id"),

  productPresentationName: text("product_presentation_name").notNull(),
  productPresentationPrice: integer("product_presentation_price").notNull(),
  quantity: integer("quantity").notNull(),
  subtotal: integer("subtotal").notNull(),

  organizationId: organizationId(),
  ...auditMetadata,
});

export const saleSequences = sqliteTable(
  "sale_sequences",
  {
    year: integer("year").notNull(),
    currentValue: integer("current_value").notNull().default(0),
    organizationId: organizationId(),
  },
  (table) => [primaryKey({ columns: [table.organizationId, table.year] })],
);

export type SaleSelect = typeof sale.$inferSelect;
export type SaleInsert = typeof sale.$inferInsert;

export type SaleItemSelect = typeof saleItem.$inferSelect;
export type SaleItemInsert = typeof saleItem.$inferInsert;

export type SaleSequenceSelect = typeof saleSequences.$inferSelect;
export type SaleSequenceInsert = typeof saleSequences.$inferInsert;
