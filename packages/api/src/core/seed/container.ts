import { auth } from "@fludge/auth";
import { databaseService } from "@fludge/db";
import { SeedAllService } from "./services/seed-all.service";
import { SeedCatalogService } from "./services/seed-catalog.service";
import { SeedCommerceService } from "./services/seed-commerce.service";
import { SeedIamService } from "./services/seed-iam.service";
import { SeedUsersService } from "./services/seed-users.service";

const seedUsersService = new SeedUsersService(databaseService, auth);
const seedIamService = new SeedIamService(databaseService, auth);
const seedCatalogService = new SeedCatalogService(databaseService);
const seedCommerceService = new SeedCommerceService(databaseService);
const seedAllService = new SeedAllService(
  seedUsersService,
  seedIamService,
  seedCatalogService,
  seedCommerceService,
);

export const seedContainer = {
  services: {
    seedUsers: seedUsersService,
    seedIam: seedIamService,
    seedCatalog: seedCatalogService,
    seedCommerce: seedCommerceService,
    seedAll: seedAllService,
  },
} as const;