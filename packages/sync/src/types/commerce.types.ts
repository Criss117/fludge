import type { LocalCustomer, LocalSale } from "@fludge/db/local-schemas/shared.schema";

import type { SyncCursor, SyncPage } from "./shared.types";

export type CommerceSyncCursors = {
  customer: SyncCursor | null;
  sale: SyncCursor | null;
};

export type CommerceSyncResult = {
  customers: SyncPage<LocalCustomer>;
  sales: SyncPage<LocalSale>;
};
