import { baseProcedure } from "@fludge/api";
import {
  requireAuthMiddleware,
  withOrganizationMiddleware,
} from "@fludge/api/middlewares/requiere-auth.middleware";
import { createOrganizationUseCase } from "./usecases/create-organization.usecase";
import { findAllOrganizationsUseCase } from "./usecases/find-all-organizations.usecase";
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
      createOrganizationUseCase(context.req.headers).execute(input),
    ),

  getActive: baseProcedure({
    method: "GET",
    tags: ["Organizations"],
  })
    .use(withOrganizationMiddleware())
    .handler(({ context }) => context.organization),

  findAll: baseProcedure({
    method: "GET",
    tags: ["Organizations"],
  })
    .use(requireAuthMiddleware())
    .handler(async ({ context }) =>
      findAllOrganizationsUseCase(context.req.headers).execute(),
    ),
};
