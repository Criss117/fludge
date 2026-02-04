import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";
import { auditMetadata, StockMovement, uuid } from "../utils";
import { organization } from "./auth";
import { sql } from "drizzle-orm";

export const category = sqliteTable(
  "category",
  {
    id: uuid().primaryKey(),
    name: text("name", {
      length: 50,
    }).notNull(),
    description: text("description", { length: 100 }),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    ...auditMetadata,
  },
  (t) => [
    unique("category_name_organization_id_idx").on(t.name, t.organizationId),
    index("category_name_idx").on(t.name),
    index("category_organizationId_idx").on(t.organizationId),
    check("category_name_min_length", sql`length(trim(${t.name})) >= 2`),
  ],
);

// Tabla de Productos Principal
export const product = sqliteTable(
  "product",
  {
    id: uuid().primaryKey(),
    sku: text("sku").notNull(), // Código de barras o identificador único
    name: text("name", { length: 50 }).notNull(),
    description: text("description", { length: 100 }),

    // Precios almacenados en centavos (ej: 1000 = $10.00)
    wholesalePrice: integer("wholesale_price").notNull().default(0),
    salePrice: integer("sale_price").notNull().default(0),
    costPrice: integer("cost_price").notNull().default(0),

    // Gestión de Inventario
    stock: integer("stock").notNull().default(0),
    reorderLevel: integer("reorder_level").default(5).notNull(), // Alerta de stock bajo

    categoryId: text("category_id").references(() => category.id),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    supplierId: text("supplier_id").references(() => supplier.id),

    ...auditMetadata,
  },
  (table) => [
    index("sku_idx").on(table.sku), // Índice para búsquedas rápidas por scanner
    index("product_name_idx").on(table.name),
    index("product_category_idx").on(table.categoryId),
    index("product_supplier_idx").on(table.supplierId),
    index("product_organization_idx").on(table.organizationId),
    index("product_stock_idx").on(table.stock),

    unique("sku_organization_id_idx").on(table.sku, table.organizationId),

    check("wholesale_price_gte_zero", sql`${table.wholesalePrice} >= 0`),
    check("sale_price_gte_zero", sql`${table.salePrice} >= 0`),
    check("cost_price_gte_zero", sql`${table.costPrice} >= 0`),
    check("reorder_level_gte_zero", sql`${table.reorderLevel} >= 0`),
    check(
      "sale_price_covers_cost",
      sql`${table.salePrice} >= ${table.costPrice}`,
    ),
    check("stock_gt_zero", sql`${table.stock} >= 0`),
  ],
);

export const supplier = sqliteTable(
  "supplier",
  {
    id: uuid().primaryKey(),
    name: text("name", { length: 50 }).notNull(),
    contactPhone: text("contact_phone", { length: 20 }),
    contactEmail: text("contact_email", { length: 50 }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    metadata: text("metadata"),
    ...auditMetadata,
  },
  (t) => [
    index("supplier_org_idx").on(t.organizationId),
    index("supplier_name_idx").on(t.name),

    unique("supplier_name_organizationId_unique").on(t.name, t.organizationId),

    check("metadata_valid_json", sql`json_valid(${t.metadata})`),
    check(
      "contact_phone_format",
      sql`${t.contactPhone} IS NULL OR (length(${t.contactPhone}) >= 7 AND ${t.contactPhone} GLOB '[0-9+-]*')`,
    ),
    check(
      "contact_email_format",
      sql`${t.contactEmail} IS NULL OR (${t.contactEmail} GLOB '*@*.*' AND ${t.contactEmail} NOT LIKE '% %')`,
    ),
  ],
);

export const stockMovement = sqliteTable(
  "stock_movement",
  {
    id: uuid().primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => product.id),

    // Tipo de movimiento: 'SALE', 'PURCHASE', 'ADJUSTMENT', 'RETURN'
    type: text("type", { enum: StockMovement.list }).notNull(),

    quantity: integer("quantity").notNull(), // Positivo para entrada, negativo para salida
    reason: text("reason", { length: 50 }), // Ej: "Inventario inicial", "Venta #102"
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    metadata: text("metadata"),
    ...auditMetadata,
  },
  (t) => [
    index("stock_movement_product_idx").on(t.productId),
    index("stock_movement_org_idx").on(t.organizationId),
    index("stock_movement_organization_idx").on(t.organizationId),
    index("stock_movement_type_idx").on(t.type),

    check("quantity_not_zero", sql`${t.quantity} != 0`),
    check("metadata_valid_json", sql`json_valid(${t.metadata})`),
  ],
);
