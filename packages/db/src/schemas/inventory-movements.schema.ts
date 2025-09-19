import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v4 } from "uuid";
import { auditMetadata } from "../helpers/audit-metadata";
import { products } from "./products.schema";

export const inventoryMovements = sqliteTable("inventory_movements", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => v4()),
  productId: text("product_id")
    .references(() => products.id)
    .notNull(),
  movementType: text("movement_type", {
    enum: ["purchase", "sale", "return"],
  }).notNull(),
  quantity: integer("quantity").notNull(),
  newStock: integer("new_stock").notNull(),
  previousStock: integer("previous_stock").notNull(),
  reason: text("reason", {
    length: 255,
  }),
  ...auditMetadata,
});

export type InsertInventoryMovement = typeof inventoryMovements.$inferInsert;
export type SelectInventoryMovement = typeof inventoryMovements.$inferSelect;
