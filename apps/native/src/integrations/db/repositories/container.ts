import { databaseService } from "..";
import { LocalClientIamRepository } from "./sync-iam.repository";

export const syncIamRepository = new LocalClientIamRepository(databaseService);

export const syncContainer = {
  syncIamRepository,
};
