// enums.ts
// SQLite no soporta enums nativos, así que definimos arrays constantes
// que luego se usan con text('campo', { enum: miArray }) en cada tabla.

export const statusEnum = ["active", "inactive"] as const;

export const actionEnum = ["update", "activate", "deactivate"] as const;

export const supplierStatusEnum = ["active", "inactive"] as const;

export const productStatusEnum = [
  "active",
  "inactive",
  "discontinued",
] as const;

export const presentationStatusEnum = ["active", "inactive"] as const;

export const movementTypeEnum = [
  "stock_in",
  "stock_out",
  "adjustment",
  "return",
] as const;

export const movementReferenceTypeEnum = [
  "sale",
  "purchase",
  "manual_adjustment",
  "return",
] as const;

export const inventoryMovementReasonEnum = [
  "initial_stock",
  "purchase",
  "sale",
  "sale_return",
  "purchase_return",
  "damaged",
  "expired",
  "lost",
  "correction",
  "manual",
] as const;

// Tipos derivados, por si los necesitas para inferencia en TS
export type Status = (typeof statusEnum)[number];
export type Action = (typeof actionEnum)[number];
export type SupplierStatus = (typeof supplierStatusEnum)[number];
export type ProductStatus = (typeof productStatusEnum)[number];
export type PresentationStatus = (typeof presentationStatusEnum)[number];
export type MovementType = (typeof movementTypeEnum)[number];
export type MovementReferenceType = (typeof movementReferenceTypeEnum)[number];
export type InventoryMovementReason =
  (typeof inventoryMovementReasonEnum)[number];
