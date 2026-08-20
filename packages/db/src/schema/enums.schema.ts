import { pgEnum } from 'drizzle-orm/pg-core';

export const statusEnum = pgEnum('status', ['active', 'inactive']);

export const actionEnum = pgEnum('action', [
  'update',
  'activate',
  'deactivate',
]);

export const supplierStatusEnum = pgEnum('supplier_status', [
  'active',
  'inactive',
]);

export const productStatusEnum = pgEnum('product_status', [
  'active',
  'inactive',
  'discontinued',
]);

export const presentationStatusEnum = pgEnum('presentation_status', [
  'active',
  'inactive',
]);

export const movementTypeEnum = pgEnum('movement_type', [
  'stock_in',
  'stock_out',
  'adjustment',
  'return',
]);

export const movementReferenceTypeEnum = pgEnum('movement_reference_type', [
  'sale',
  'purchase',
  'manual_adjustment',
  'return',
]);

export const inventoryMovementReasonEnum = pgEnum('inventory_movement_reason', [
  'initial_stock',
  'purchase',
  'sale',
  'sale_return',
  'purchase_return',
  'damaged',
  'expired',
  'lost',
  'correction',
  'manual',
]);
