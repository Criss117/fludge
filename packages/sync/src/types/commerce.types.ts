import type {
  LocalCustomer,
  LocalSale,
} from "@fludge/db/local-schemas/shared.schema";

export type CommerceLastSyncedAt = {
  customer: Date | null;
  sale: Date | null;
};

export type CommerceSyncResult = {
  customers: LocalCustomer[];
  sales: LocalSale[];
};
