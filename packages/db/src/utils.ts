import { sql } from "drizzle-orm";
import { integer, text } from "drizzle-orm/sqlite-core";
import { v7 } from "uuid";

export const auditMetadata = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull()
    .$onUpdate(() => /* @__PURE__ */ new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
};

export function uuid(name = "id") {
  return text(name).$defaultFn(() => v7());
}

export const StockMovement = {
  list: ["SALE", "PURCHASE", "ADJUSTMENT", "RETURN"],
  listEs: ["VENTA", "COMPRA", "AJUSTE", "DEVOLUCION"],
  obj: {
    SALE: "SALE",
    PURCHASE: "PURCHASE",
    ADJUSTMENT: "ADJUSTMENT",
    RETURN: "RETURN",
  },
  objEs: {
    SALE: "VENTA",
    PURCHASE: "COMPRA",
    ADJUSTMENT: "AJUSTE",
    RETURN: "DEVOLUCION",
  },
} as const;

export const TicketStatus = {
  list: ["PENDING", "PARTIAL", "PAID", "CANCELLED"],
  listEs: ["PENDIENTE", "PARCIAL", "PAGADO", "CANCELADO"],
  obj: {
    PENDING: "PENDING",
    PARTIAL: "PARTIAL",
    PAID: "PAID",
    CANCELLED: "CANCELLED",
  },
  objEs: {
    PENDING: "PENDIENTE",
    PARTIAL: "PARCIAL",
    PAID: "PAGADO",
    CANCELLED: "CANCELADO",
  },
} as const;

export const PaymentMethod = {
  list: ["CASH", "CARD", "CREDIT", "TRANSFER"],
  listEs: ["EFECTIVO", "TARJETA", "CREDITO", "TRANSFERENCIA"],
  obj: {
    CASH: "CASH",
    CARD: "CARD",
    CREDIT: "CREDIT",
    TRANSFER: "TRANSFER",
  },
  objEs: {
    CASH: "EFECTIVO",
    CARD: "TARJETA",
    CREDIT: "CREDITO",
    TRANSFER: "TRANSFERENCIA",
  },
} as const;
