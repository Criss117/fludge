import { databaseService } from "@fludge/db";
import { SeedService } from "./seed.service";
import { auth } from "@fludge/auth";
import { organizationContainer } from "../iam/organization/container";
import { productContainer } from "../catalog/products/container";

const seedService = new SeedService(
  databaseService,
  auth,
  organizationContainer.repositories.organizationRepository,
  productContainer.repositories.productRepository,
);

export const seedContainer = {
  services: {
    seed: seedService,
  },
  commands: {},
};
