import { databaseService } from "@fludge/db";
import { SyncIamRepository } from "./infrastructure/repositories/sync-iam.repository";
import { SyncServerIamEngine } from "@fludge/sync/engine/iam/sync-server-iam.engine";
import { FindSyncIamQuery } from "./application/queries/find-sync-iam.query";
import { SyncCatalogRepository } from "./infrastructure/repositories/sync-catalog.repository";
import { SyncServerCatalogEngine } from "@fludge/sync/engine/catalog/sync-server-catalog.engine";
import { FindSyncCatalogQuery } from "./application/queries/find-sync-catalog.query";

// Repositories
const syncIamRepository = new SyncIamRepository(databaseService);
const syncCatalogRepository = new SyncCatalogRepository(databaseService);

// Engines
const syncIamEngine = new SyncServerIamEngine(syncIamRepository);
const syncCatalogEngine = new SyncServerCatalogEngine(syncCatalogRepository);

// Queires
const findSyncIamQuery = new FindSyncIamQuery(databaseService, syncIamEngine);
const findSyncCatalogQuery = new FindSyncCatalogQuery(
  databaseService,
  syncCatalogEngine,
);

export const syncContainer = {
  repositories: {
    syncIamRepository,
  },
  engines: {
    syncIamEngine,
    syncCatalogEngine,
  },
  queries: {
    findSyncIamQuery,
    findSyncCatalogQuery,
  },
};
