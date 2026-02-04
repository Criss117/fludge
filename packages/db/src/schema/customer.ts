import {
  check,
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { auditMetadata, PaymentMethod, uuid } from "../utils";
import { organization } from "./auth";
import { sql } from "drizzle-orm";

export const customer = sqliteTable(
  "customer",
  {
    id: uuid().primaryKey(),
    name: text("name", { length: 100 }).notNull(),
    email: text("email", { length: 100 }),
    phone: text("phone", { length: 20 }),
    address: text("address", { length: 100 }),

    // Límite de crédito (en centavos)
    creditLimit: integer("credit_limit").notNull().default(0),
    // Saldo actual adeudado (opcional, pero útil para evitar calcularlo cada vez)
    currentBalance: integer("current_balance").notNull().default(0),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    ...auditMetadata,
  },
  (t) => [
    index("customer_org_idx").on(t.organizationId), // ¡Añade este!
    index("customer_name_idx").on(t.name),

    check("credit_limit_gte_zero", sql`${t.creditLimit} >= 0`),
    check("current_balance_gt_zero", sql`${t.currentBalance} >= 0`),
    check("balance_within_limit", sql`${t.currentBalance} <= ${t.creditLimit}`),
    check(
      "phone_format",
      sql`${t.phone} IS NULL OR (length(${t.phone}) >= 7 AND ${t.phone} GLOB '[0-9+-]*')`,
    ),
  ],
);

export const creditPayment = sqliteTable(
  "credit_payment",
  {
    id: uuid().primaryKey(),
    customerId: text("customer_id")
      .notNull()
      .references(() => customer.id, { onDelete: "cascade" }),

    amount: integer("amount").notNull(), // Monto del abono
    paymentMethod: text("payment_method", { enum: PaymentMethod.list }), // Ej: 'CASH', 'TRANSFER'

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    metadata: text("metadata"), // Para notas adicionales del abono
    ...auditMetadata,
  },
  (t) => [
    index("payment_customer_idx").on(t.customerId),
    index("payment_org_idx").on(t.organizationId),
    check("amount_gt_zero", sql`${t.amount} > 0`),
    check("metadata_valid_json", sql`json_valid(${t.metadata})`),
  ],
);
