import { databaseService } from "@fludge/db";
import { SeedService } from "./seed.service";
import { auth } from "@fludge/auth";
import { organizationContainer } from "../iam/organization/container";

const seedService = new SeedService(
  databaseService,
  auth,
  organizationContainer.repositories.organizationRepository,
);

export const seedContainer = {
  services: {
    seed: seedService,
  },
  commands: {},
};
