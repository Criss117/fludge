import { devOnlyProcedure } from "@fludge/api/index";
import { seedUsersValidator } from "@fludge/utils/validators/seed.validators";
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
      .handler(() =>
        seedContainer.services.seedUsers.clearAuthTables(),
      ),
  },
} as const;