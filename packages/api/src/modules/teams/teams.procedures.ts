import { baseProcedure } from "@fludge/api";
import { requireAuthMiddleware } from "@fludge/api/middlewares/requiere-auth.middleware";
import { findManyTeamsUseCase } from "./usecases/find-many-teams.usecase";
import { createTeamUseCase } from "./usecases/create-team.usecase";
import {
  createTeamSchema,
  removeManyTeamsSchema,
  updateTeamSchema,
} from "@fludge/utils/validators/team.schemas";
import { AnyOrganizationActiveUseCase } from "../organizations/exceptions/any-organization-active.usecase";
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
    .use(requireAuthMiddleware())
    .input(createTeamSchema)
    .handler(({ input, context }) => {
      const activeOrganizationId = context.session.activeOrganizationId;

      if (!activeOrganizationId) throw new AnyOrganizationActiveUseCase();

      return createTeamUseCase(context.req.headers).execute(
        input,
        activeOrganizationId,
      );
    }),

  remove: baseProcedure({
    method: "DELETE",
  })
    .use(requireAuthMiddleware())
    .input(removeManyTeamsSchema)
    .handler(({ input, context }) =>
      deleteTeamsUseCase(context.req.headers).execute(input),
    ),
  update: baseProcedure({
    method: "PUT",
  })
    .use(requireAuthMiddleware())
    .input(updateTeamSchema)
    .handler(({ input, context }) =>
      updateTeamUseCase(context.req.headers).execute(input),
    ),
};
