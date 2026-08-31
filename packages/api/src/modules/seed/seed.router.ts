import { devOnlyProcedure } from "../..";
import { seedContainer } from "./container";
import {
  seedAll,
  seedCategories,
  seedOrganizations,
  seedProducts,
  seedUsers,
} from "./seed.service";

const TAGS = ["Seed"] as const;

export const seedRouter = {
  clear: devOnlyProcedure
    .route({
      method: "POST",
      path: "/seed/clear",
      tags: TAGS,
    })
    .handler(() => seedContainer.services.seed.clear()),

  seedUsers: devOnlyProcedure
    .route({
      method: "POST",
      path: "/seed/users",
      tags: TAGS,
    })
    .input(seedUsers)
    .handler(({ input, context }) =>
      seedContainer.services.seed.seedUsers(context.headers, input),
    ),

  seedOrganizations: devOnlyProcedure
    .route({
      method: "POST",
      path: "/seed/organizations",
      tags: TAGS,
    })
    .input(seedOrganizations)
    .handler(({ input }) =>
      seedContainer.services.seed.seedOrganizations(input),
    ),

  seedCategories: devOnlyProcedure
    .route({
      method: "POST",
      path: "/seed/categories",
      tags: TAGS,
    })
    .input(seedCategories)
    .handler(({ input }) => seedContainer.services.seed.seedCategories(input)),

  seedProducts: devOnlyProcedure
    .route({
      method: "POST",
      path: "/seed/products",
      tags: TAGS,
    })
    .input(seedProducts)
    .handler(({ input }) => seedContainer.services.seed.seedProducts(input)),

  seedAll: devOnlyProcedure
    .route({
      method: "POST",
      path: "/seed/all",
      tags: TAGS,
    })
    .input(seedAll)
    .handler(({ input, context }) =>
      seedContainer.services.seed.seedAll(context.headers, input),
    ),
};
