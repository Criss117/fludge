import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { auditMetadata } from "../shared";
import { localProduct } from "./shared.schema";

export const tickets = sqliteTable("tickets", {
  id: text("id").primaryKey(),
  createdAt: auditMetadata.createdAt,
  updatedAt: auditMetadata.updatedAt,
});

export const ticketProductTypeValues = ["catalog", "adHoc"] as const;
export type TicketProductType = (typeof ticketProductTypeValues)[number];

export const ticketProducts = sqliteTable(
  "ticket_products",
  {
    ticketId: text("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    rowId: integer("row_id").primaryKey({ autoIncrement: true }),

    productId: text("product_id").references(() => localProduct.id, {
      onDelete: "set null",
    }),

    type: text("type", { enum: ticketProductTypeValues }).notNull(),

    stock: real("stock").notNull(),
    minStock: real("min_stock").notNull(),
    allowsNegativeStock: integer("allows_negative_stock", {
      mode: "boolean",
    })
      .notNull()
      .default(false),

    createdAt: auditMetadata.createdAt,
    updatedAt: auditMetadata.updatedAt,
  },
  (table) => [
    uniqueIndex("ticket_product_unique_idx").on(
      table.ticketId,
      table.productId,
    ),
  ],
);

export const ticketProductPresentations = sqliteTable(
  "ticket_product_presentations",
  {
    rowId: integer("row_id").primaryKey({ autoIncrement: true }),

    ticketProductRowId: integer("ticket_product_row_id")
      .notNull()
      .references(() => ticketProducts.productId, { onDelete: "cascade" }),

    presentationId: text("presentation_id").notNull(),

    name: text("name").notNull(),
    originalPrice: real("original_price").notNull(),
    wholesalePrice: real("wholesale_price"), // null permitido
    conversionFactor: real("conversion_factor").notNull(),
    priceSale: real("price_sale").notNull(),
    quantity: real("quantity").notNull(),

    createdAt: auditMetadata.createdAt,
    updatedAt: auditMetadata.updatedAt,
  },
  (table) => [
    // Una presentación no puede repetirse dentro del mismo ticket_product
    uniqueIndex("presentation_unique_idx").on(
      table.ticketProductRowId,
      table.presentationId,
    ),
  ],
);

export type TicketSelect = typeof tickets.$inferSelect;
export type TicketInsert = typeof tickets.$inferInsert;

export type TicketProductSelect = typeof ticketProducts.$inferSelect;
export type TicketProductInsert = typeof ticketProducts.$inferInsert;

export type TicketProductPresentationSelect =
  typeof ticketProductPresentations.$inferSelect;
export type TicketProductPresentationInsert =
  typeof ticketProductPresentations.$inferInsert;
