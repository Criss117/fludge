import { databaseService } from "@fludge/db";
import { SqliteSyncCommerceRepository } from "./repositories/sqlite-sync-commerce.repository";
import { SqliteSyncCatalogRepository } from "./repositories/sqlite-sync-catalog.repository";
import { SQLiteSyncIamRepository } from "./repositories/sqlite-sync-iam.repository";
import { SyncCommerceQuery } from "./queries/sync-sale.query";
import { SyncCatalogQuery } from "./queries/sync-catalog.query";
import { SyncIamQuery } from "./queries/sync-iam.query";

const syncCommerceRepository = new SqliteSyncCommerceRepository(
  databaseService,
);
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
