import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { auditMetadata } from "../shared";
import { customerPayment } from "./customer-payment.schema";
import { sale } from "./sales.schema";

export const customerPaymentApplication = sqliteTable(
  "customer_payment_application",
  {
    paymentId: text("payment_id")
      .notNull()
      .references(() => customerPayment.id, {
        onDelete: "cascade",
      }),

    saleId: text("sale_id")
      .notNull()
      .references(() => sale.id, {
        onDelete: "restrict",
      }),

    amount: integer("amount").notNull(),

    createdAt: auditMetadata.createdAt,
  },
  (table) => [
    primaryKey({ columns: [table.paymentId, table.saleId] }),
  ],
);

export type CustomerPaymentApplicationSelect =
  typeof customerPaymentApplication.$inferSelect;
export type CustomerPaymentApplicationInsert =
  typeof customerPaymentApplication.$inferInsert;