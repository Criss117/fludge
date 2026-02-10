import { baseProcedure } from "@fludge/api";
import {
  requireAuthMiddleware,
  withOrganizationMiddleware,
} from "@fludge/api/middlewares/requiere-auth.middleware";
import { findManyTeamsUseCase } from "./usecases/find-many-teams.usecase";
import { createTeamUseCase } from "./usecases/create-team.usecase";
import {
  createTeamSchema,
  removeManyTeamsSchema,
  updateTeamSchema,
} from "@fludge/utils/validators/team.schemas";
import { deleteTeamsUseCase } from "./usecases/delete-teams.usecase";
import { updateTeamUseCase } from "./usecases/update-team.usecase";

export const teamsProcedures = {
  findMany: baseProcedure({
    method: "GET",
  })
    .use(requireAuthMiddleware())
    .handler(({ context }) =>
      findManyTeamsUseCase(context.req.headers).execute(),
    ),

  create: baseProcedure({
    method: "POST",
  })
    .use(withOrganizationMiddleware())
    .input(createTeamSchema)
    .handler(({ input, context }) =>
      createTeamUseCase().execute(context.organization.id, input),
    ),

  remove: baseProcedure({
    method: "DELETE",
  })
    .use(withOrganizationMiddleware())
    .input(removeManyTeamsSchema)
    .handler(({ input, context }) =>
      deleteTeamsUseCase().execute(context.organization.id, input),
    ),
  update: baseProcedure({
    method: "PUT",
  })
    .use(withOrganizationMiddleware())
    .input(updateTeamSchema)
    .handler(({ input, context }) =>
      updateTeamUseCase().execute(context.organization.id, input),
    ),
};
