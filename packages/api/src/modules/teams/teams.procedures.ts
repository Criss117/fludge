import { baseProcedure } from "@fludge/api";
import { withOrganizationMiddleware } from "@fludge/api/middlewares/requiere-auth.middleware";
import { findAllTeamsUseCase } from "./usecases/find-all-teams.usecase";
import { createTeamUseCase } from "./usecases/create-team.usecase";
import { deleteTeamsUseCase } from "./usecases/delete-teams.usecase";
import { updateTeamUseCase } from "./usecases/update-team.usecase";
import {
  createTeamSchema,
  createTeamsMembersSchema,
  removeManyTeamsSchema,
  updateTeamSchema,
} from "@fludge/utils/validators/team.schemas";
import { createTeamsMembersUseCase } from "./usecases/create-teams-members.usecase";
import { deleteTeamsMembersUseCase } from "./usecases/delete-teams-members.usecase";

export const teamsProcedures = {
  findAll: baseProcedure({
    method: "GET",
    tags: ["Teams"],
  })
    .use(withOrganizationMiddleware())
    .handler(({ context }) =>
      findAllTeamsUseCase.execute(context.organization.id),
    ),

  create: baseProcedure({
    method: "POST",
    tags: ["Teams"],
  })
    .use(withOrganizationMiddleware())
    .input(createTeamSchema)
    .handler(({ input, context }) =>
      createTeamUseCase.execute(context.organization.id, input),
    ),

  remove: baseProcedure({
    method: "DELETE",
    tags: ["Teams"],
  })
    .use(withOrganizationMiddleware())
    .input(removeManyTeamsSchema)
    .handler(({ input, context }) =>
      deleteTeamsUseCase.execute(context.organization.id, input),
    ),

  update: baseProcedure({
    method: "PUT",
    tags: ["Teams"],
  })
    .use(withOrganizationMiddleware())
    .input(updateTeamSchema)
    .handler(({ input, context }) =>
      updateTeamUseCase.execute(context.organization.id, input),
    ),

  teamMembers: {
    create: baseProcedure({
      method: "POST",
      tags: ["Teams"],
    })
      .use(withOrganizationMiddleware())
      .input(createTeamsMembersSchema)
      .handler(({ input, context }) =>
        createTeamsMembersUseCase.execute(context.organization.id, input),
      ),

    delete: baseProcedure({
      method: "POST",
      tags: ["Teams"],
    })
      .use(withOrganizationMiddleware())
      .input(createTeamsMembersSchema)
      .handler(({ input, context }) =>
        deleteTeamsMembersUseCase.execute(context.organization.id, input),
      ),
  },
};
