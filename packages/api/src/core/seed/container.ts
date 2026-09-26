import { auth } from "@fludge/auth";
import { databaseService } from "@fludge/db";
import { SeedUsersService } from "./services/seed-users.service";

const seedUsersService = new SeedUsersService(databaseService, auth);

export const seedContainer = {
  services: {
    seedUsers: seedUsersService,
  },
} as const;