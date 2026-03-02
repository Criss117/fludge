import { baseProcedure } from "@fludge/api";
import { requireAuthMiddleware } from "@fludge/api/middlewares/requiere-auth.middleware";
import { createOrganizationUseCase } from "./usecases/create-organization.usecase";
import { createOrganizationSchema } from "@fludge/utils/validators/organization.schema";

export const organizationsProcedures = {
  create: baseProcedure({
    method: "POST",
    tags: ["Organizations"],
  })
    .use(
      requireAuthMiddleware({
        onlyRootUser: true,
      }),
    )
    .input(createOrganizationSchema)
    .handler(async ({ input, context }) =>
      createOrganizationUseCase.execute(context.session.user.id, input),
    ),
};
