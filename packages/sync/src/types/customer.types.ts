import type { LocalCustomerSelect } from "@fludge/db/local-schemas/shared.schema";

export type CustomerLastSyncedAtLocal = {
  customer: LocalCustomerSelect | null;
};

export type CustomerLastSyncedAtQuery = {
  customer: Date | null;
};

export type CustomerSyncAllItems = {
  customers: LocalCustomerSelect[];
};