import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import {
  customerPaymentMethodEnum,
  customerPaymentStatusEnum,
} from "@fludge/utils/enums/db-enums";
import { auditMetadata } from "../shared";
import { customer } from "./customer.schema";
import { memberId, organizationId } from "./iam.schema";

export const customerPayment = sqliteTable(
  "customer_payment",
  {
    id: text("id").primaryKey(),

    customerId: text("customer_id")
      .notNull()
      .references(() => customer.id, {
        onDelete: "restrict",
      }),

    amount: integer("amount").notNull(),

    method: text("method", { enum: customerPaymentMethodEnum }).notNull(),

    status: text("status", { enum: customerPaymentStatusEnum })
      .notNull()
      .default("active"),

    notes: text("notes"),

    cancelledAt: integer("cancelled_at", { mode: "timestamp_ms" }),
    cancelReason: text("cancel_reason"),

    organizationId: organizationId(),
    createdBy: memberId(),
    createdAt: auditMetadata.createdAt,
    updatedAt: auditMetadata.updatedAt,
  },
  (t) => [
    index("customer_payment_org_customer_idx").on(
      t.organizationId,
      t.customerId,
    ),

    index("customer_payment_org_status_idx").on(t.organizationId, t.status),

    index("customer_payment_created_at_idx").on(t.createdAt),

    check("customer_payment_amount_positive", sql`${t.amount} > 0`),

    check(
      "customer_payment_cancel_reason_length",
      sql`${t.cancelReason} IS NULL OR length(${t.cancelReason}) BETWEEN 3 AND 500`,
    ),
  ],
);

export type CustomerPaymentSelect = typeof customerPayment.$inferSelect;
export type CustomerPaymentInsert = typeof customerPayment.$inferInsert;