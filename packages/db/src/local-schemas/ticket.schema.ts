import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import {
  localOrganization,
  localProduct,
  localProductPresentation,
} from "./shared.schema";
import { sql } from "drizzle-orm";

export const ticketProductTypeValues = ["catalog", "adHoc"] as const;

export const ticket = sqliteTable(
  "ticket",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => localOrganization.id, {
        onDelete: "cascade",
      }),
  },
  (t) => [
    uniqueIndex("ticket_organization_name_unique").on(t.organizationId, t.name),
    uniqueIndex("ticket_organization_active_unique")
      .on(t.organizationId, t.isActive)
      .where(sql`${t.isActive} = 1`),
  ],
);

export const ticketProduct = sqliteTable(
  "ticket_product",
  {
    id: text("id").primaryKey(),
    ticketId: text("ticket_id")
      .notNull()
      .references(() => ticket.id, { onDelete: "cascade" }),

    productId: text("product_id").references(() => localProduct.id, {
      onDelete: "set null",
    }),

    type: text("type", { enum: ticketProductTypeValues }).notNull(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => localOrganization.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    uniqueIndex("ticket_product_unique_idx").on(
      table.ticketId,
      table.productId,
    ),
  ],
);

export const ticketProductPresentation = sqliteTable(
  "ticket_product_presentation",
  {
    id: text("id").primaryKey(),

    ticketProductId: text("ticket_product_id")
      .notNull()
      .references(() => ticketProduct.id, { onDelete: "cascade" }),

    presentationId: text("presentation_id").references(
      () => localProductPresentation.id,
      {
        onDelete: "cascade",
      },
    ),

    name: text("name").notNull(),
    originalPrice: real("original_price").notNull(),
    wholesalePrice: real("wholesale_price"), // null permitido
    conversionFactor: real("conversion_factor").notNull(),
    priceSale: real("price_sale").notNull(),
    quantity: real("quantity").notNull(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => localOrganization.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    // Una presentación no puede repetirse dentro del mismo ticket_product
    uniqueIndex("presentation_unique_idx").on(
      table.ticketProductId,
      table.presentationId,
    ),
  ],
);

export type TicketSelect = typeof ticket.$inferSelect;
export type TicketInsert = typeof ticket.$inferInsert;

export type TicketProductSelect = typeof ticketProduct.$inferSelect;
export type TicketProductInsert = typeof ticketProduct.$inferInsert;

export type TicketProductPresentationSelect =
  typeof ticketProductPresentation.$inferSelect;
export type TicketProductPresentationInsert =
  typeof ticketProductPresentation.$inferInsert;
