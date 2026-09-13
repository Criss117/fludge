import { databaseService } from "@fludge/db";
import { SyncIamRepository } from "./infrastructure/repositories/sync-iam.repository";
import { SyncServerIamEngine } from "@fludge/sync/engine/iam/sync-server-iam.engine";
import { FindSyncIamQuery } from "./application/queries/find-sync-iam.query";

// Repositories
const syncIamRepository = new SyncIamRepository(databaseService);

// Engines
const syncIamEngine = new SyncServerIamEngine(syncIamRepository);

// Queires
const findSyncIamQuery = new FindSyncIamQuery(databaseService, syncIamEngine);

export const syncContainer = {
  repositories: {
    syncIamRepository,
  },
  engines: {
    syncIamEngine,
  },
  queries: {
    findSyncIamQuery,
  },
};
