import type { LocalCategory, LocalProduct } from "@fludge/db/local-schemas/shared.schema";

import type { SyncCursor, SyncPage } from "./shared.types";

export type CatalogSyncCursors = {
  category: SyncCursor | null;
  product: SyncCursor | null;
};

export type CatalogSyncResult = {
  categories: SyncPage<LocalCategory>;
  products: SyncPage<LocalProduct>;
};
