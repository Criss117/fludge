import { databaseService } from "@fludge/db";

import { SyncCatalogQuery } from "./queries/sync-catalog.query";
import { SyncCommerceQuery } from "./queries/sync-commerce.query";
import { SyncIamQuery } from "./queries/sync-iam.query";
import { SqliteSyncCatalogRepository } from "./repositories/sqlite-sync-catalog.repository";
import { SqliteSyncCommerceRepository } from "./repositories/sqlite-sync-commerce.repository";
import { SQLiteSyncIamRepository } from "./repositories/sqlite-sync-iam.repository";

const syncCommerceRepository = new SqliteSyncCommerceRepository(databaseService);
const syncCatalogRepository = new SqliteSyncCatalogRepository(databaseService);
const syncIamRepository = new SQLiteSyncIamRepository(databaseService);

const syncCommerceQuery = new SyncCommerceQuery(syncCommerceRepository);
const syncCatalogQuery = new SyncCatalogQuery(syncCatalogRepository);
const syncIamQuery = new SyncIamQuery(syncIamRepository);

export const syncContainer = {
  repositories: {
    syncCommerceRepository,
    syncCatalogRepository,
    syncIamRepository,
  },
  queries: {
    syncCommerce: syncCommerceQuery,
    syncCatalog: syncCatalogQuery,
    syncIam: syncIamQuery,
  },
};
