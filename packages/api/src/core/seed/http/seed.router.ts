import { devOnlyProcedure } from "@fludge/api/index";
import {
  seedAllValidator,
  seedCatalogValidator,
  seedCommerceValidator,
  seedIamValidator,
  seedUsersValidator,
} from "@fludge/utils/validators/seed.validators";
import { seedContainer } from "../container";

const TAGS = ["Seed"] as const;

export const seedRouter = {
  commands: {
    seedUsers: devOnlyProcedure
      .route({
        method: "POST",
        path: "/seed/users",
        tags: TAGS,
      })
      .input(seedUsersValidator)
      .handler(({ input, context }) =>
        seedContainer.services.seedUsers.seed(context.headers, input),
      ),

    clearAuthTables: devOnlyProcedure
      .route({
        method: "DELETE",
        path: "/seed/auth-tables",
        tags: TAGS,
      })
      .handler(() => seedContainer.services.seedUsers.clearAuthTables()),

    seedIam: devOnlyProcedure
      .route({
        method: "POST",
        path: "/seed/iam",
        tags: TAGS,
      })
      .input(seedIamValidator)
      .handler(({ input, context }) =>
        seedContainer.services.seedIam.seed(context.headers, input),
      ),

    clearIamTables: devOnlyProcedure
      .route({
        method: "DELETE",
        path: "/seed/iam-tables",
        tags: TAGS,
      })
      .handler(() => seedContainer.services.seedIam.clearIamTables()),

    seedCatalog: devOnlyProcedure
      .route({
        method: "POST",
        path: "/seed/catalog",
        tags: TAGS,
      })
      .input(seedCatalogValidator)
      .handler(({ input }) => seedContainer.services.seedCatalog.seed(input)),

    clearCatalogTables: devOnlyProcedure
      .route({
        method: "DELETE",
        path: "/seed/catalog-tables",
        tags: TAGS,
      })
      .handler(() => seedContainer.services.seedCatalog.clearCatalogTables()),

    seedCommerce: devOnlyProcedure
      .route({
        method: "POST",
        path: "/seed/commerce",
        tags: TAGS,
      })
      .input(seedCommerceValidator)
      .handler(({ input }) => seedContainer.services.seedCommerce.seed(input)),

    clearCommerceTables: devOnlyProcedure
      .route({
        method: "DELETE",
        path: "/seed/commerce-tables",
        tags: TAGS,
      })
      .handler(() => seedContainer.services.seedCommerce.clearCommerceTables()),

    seedAll: devOnlyProcedure
      .route({
        method: "POST",
        path: "/seed/all",
        tags: TAGS,
      })
      .input(seedAllValidator)
      .handler(({ input, context }) =>
        seedContainer.services.seedAll.seed(context.headers, input),
      ),

    clearAllTables: devOnlyProcedure
      .route({
        method: "DELETE",
        path: "/seed/all-tables",
        tags: TAGS,
      })
      .handler(() => seedContainer.services.seedAll.clearAllTables()),
  },
} as const;
