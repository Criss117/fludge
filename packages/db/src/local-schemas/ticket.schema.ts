import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { localOrganization, localProduct } from "./shared.schema";
import { sql } from "drizzle-orm";

export const ticketProductTypeValues = ["catalog", "adHoc"] as const;

export type TicketProductPresentation = {
  id: string;
  conversionFactor: number;
  name: string;
  originalPrice: number;
  presentationId: string | null;
  priceSale: number;
  quantity: number;
  wholesalePrice: number | null;
};

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

    presentations: text("presentations", { mode: "json" })
      .notNull()
      .$type<TicketProductPresentation[]>(),
  },
  (table) => [
    uniqueIndex("ticket_product_unique_idx").on(
      table.ticketId,
      table.productId,
    ),
  ],
);

export type TicketSelect = typeof ticket.$inferSelect;
export type TicketInsert = typeof ticket.$inferInsert;

export type TicketProductSelect = typeof ticketProduct.$inferSelect;
export type TicketProductInsert = typeof ticketProduct.$inferInsert;
