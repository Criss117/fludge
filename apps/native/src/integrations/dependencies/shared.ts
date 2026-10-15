import { databaseService } from "../db";
import { NativeSyncStateRepository } from "../db/repositories/native-sync-state.repository";

export const syncStateRepository = new NativeSyncStateRepository(
  databaseService,
);
