import { baseProcedure } from "@fludge/api";
import { requireAuthMiddleware } from "@fludge/api/middlewares/requiere-auth.middleware";
import { auth } from "@fludge/auth";
import { createOrganizationSchema } from "./schemas/create-organization.schema";
import { createOrganizationUseCase } from "./usecases/create-organization.usecase";

export const organizationsProcedures = {
  create: baseProcedure
    .use(
      requireAuthMiddleware({
        onlyRootUser: true,
      }),
    )
    .input(createOrganizationSchema)
    .handler(async ({ input, context }) =>
      createOrganizationUseCase(context.req.headers).execute(input),
    ),

  findAll: baseProcedure
    .use(requireAuthMiddleware())
    .handler(async ({ context }) => {
      const orgs = await auth.api.listOrganizations({
        headers: context.req.headers,
      });

      const teams = await auth.api.listOrganizationTeams({
        headers: context.req.headers,
      });

      return { orgs, teams };
    }),
};
