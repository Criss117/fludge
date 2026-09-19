import { databaseService } from "@fludge/db";
import { SyncIamRepository } from "./infrastructure/repositories/sync-iam.repository";
import { SyncServerIamEngine } from "@fludge/sync/engine/iam/sync-server-iam.engine";
import { FindSyncIamQuery } from "./application/queries/find-sync-iam.query";
import { SyncCatalogRepository } from "./infrastructure/repositories/sync-catalog.repository";
import { SyncServerCatalogEngine } from "@fludge/sync/engine/catalog/sync-server-catalog.engine";
import { FindSyncCatalogQuery } from "./application/queries/find-sync-catalog.query";
import { SyncCustomerRepository } from "./infrastructure/repositories/sync-customer.repository";
import { SyncServerCustomerEngine } from "@fludge/sync/engine/customer/sync-server-customer.engine";
import { FindSyncCustomerQuery } from "./application/queries/find-sync-customer.query";

// Repositories
const syncIamRepository = new SyncIamRepository(databaseService);
const syncCatalogRepository = new SyncCatalogRepository(databaseService);
const syncCustomerRepository = new SyncCustomerRepository(databaseService);

// Engines
const syncIamEngine = new SyncServerIamEngine(syncIamRepository);
const syncCatalogEngine = new SyncServerCatalogEngine(syncCatalogRepository);
const syncCustomerEngine = new SyncServerCustomerEngine(syncCustomerRepository);

// Queires
const findSyncIamQuery = new FindSyncIamQuery(databaseService, syncIamEngine);
const findSyncCatalogQuery = new FindSyncCatalogQuery(
  databaseService,
  syncCatalogEngine,
);
const findSyncCustomerQuery = new FindSyncCustomerQuery(
  databaseService,
  syncCustomerEngine,
);

export const syncContainer = {
  repositories: {
    syncIamRepository,
  },
  engines: {
    syncIamEngine,
    syncCatalogEngine,
    syncCustomerEngine,
  },
  queries: {
    findSyncIamQuery,
    findSyncCatalogQuery,
    findSyncCustomerQuery,
  },
};
