import {
  check,
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { auditMetadata, PaymentMethod, TicketStatus, uuid } from "../utils";
import { customer } from "./customer";
import { organization, user } from "./auth";
import { product } from "./product";
import { type SQL, sql } from "drizzle-orm";

export const ticket = sqliteTable(
  "ticket",
  {
    id: uuid().primaryKey(),
    // customerId es NULLABLE para permitir ventas anónimas [1]
    customerId: text("customer_id").references(() => customer.id, {
      onDelete: "set null",
    }),

    // Totales en centavos para precisión absoluta
    totalAmount: integer("total_amount").notNull().default(0),
    paidAmount: integer("paid_amount").notNull().default(0),

    // 'PENDING', 'PARTIAL', 'PAID', 'CANCELLED'
    status: text("status", { enum: TicketStatus.list })
      .notNull()
      .default("PENDING"),

    paymentMethod: text("payment_method", {
      enum: PaymentMethod.list,
    }).notNull(), // 'CASH', 'CARD', 'CREDIT'
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "set null" }),

    ...auditMetadata,
  },
  (t) => [
    index("ticket_customer_idx").on(t.customerId),
    index("ticket_status_idx").on(t.status),
    index("ticket_org_idx").on(t.organizationId),
    index("ticket_user_idx").on(t.userId),

    check("total_amount_gt_zero", sql`${t.totalAmount} > 0`),
    check("paid_amount_gte_zero", sql`${t.paidAmount} >= 0`),
    check(
      "paid_amount_lte_total_amount",
      sql`${t.paidAmount} <= ${t.totalAmount}`,
    ),
  ],
);

export const ticketDetail = sqliteTable(
  "ticket_detail",
  {
    id: uuid().primaryKey(),
    ticketId: text("ticket_id")
      .notNull()
      .references(() => ticket.id, { onDelete: "cascade" }),

    // Tipo de movimiento: 'SALE', 'PURCHASE', 'ADJUSTMENT', 'RETURN'
    sku: text("sku").notNull(), // Código de barras o identificador único
    name: text("name", { length: 50 }).notNull(),
    description: text("description", { length: 100 }),

    salePrice: integer("sale_price").notNull(),
    quantity: integer("quantity").notNull(),
    subTotal: integer("sub_total")
      .notNull()
      .generatedAlwaysAs(
        (): SQL => sql`${ticketDetail.salePrice} * ${ticketDetail.quantity}`,
      ),

    productId: text("product_id").references(() => product.id, {
      onDelete: "set null",
    }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    ...auditMetadata,
  },
  (t) => [
    index("ticket_detail_ticket_idx").on(t.ticketId),
    index("ticket_detail_org_idx").on(t.organizationId),
    index("ticket_detail_organization_idx").on(t.organizationId),
    index("ticket_detail_product_idx").on(t.productId),

    check("quantity_gt_zero", sql`${t.quantity} > 0`),
    check("sub_total_gte_zero", sql`${t.subTotal} >= 0`),
    check("sale_price_gte_zero", sql`${t.salePrice} >= 0`),
    check(
      "sub_total_correct",
      sql`${t.subTotal} = ${t.salePrice} * ${t.quantity}`,
    ),
  ],
);
