import type {
  LocalSaleItemSelect,
  LocalSaleSelect,
} from "@fludge/db/local-schemas/shared.schema";

export type SaleLastSyncedAtLocal = {
  sale: LocalSaleSelect | null;
  saleItem: LocalSaleItemSelect | null;
};

export type SaleLastSyncedAtQuery = {
  sale: Date | null;
  saleItem: Date | null;
};

export type SaleSyncAllItems = {
  sales: LocalSaleSelect[];
  saleItems: LocalSaleItemSelect[];
};
