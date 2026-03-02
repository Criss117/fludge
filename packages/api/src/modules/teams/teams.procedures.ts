import { baseProcedure } from "@fludge/api";
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
import { withPermissionsMiddleware } from "@fludge/api/middlewares/with-permissions.middleware";

export const teamsProcedures = {
  findAll: baseProcedure({
    method: "GET",
    tags: ["Teams"],
  })
    .use(
      withPermissionsMiddleware({
        permissions: ["read:team"],
      }),
    )
    .handler(({ context }) =>
      findAllTeamsUseCase.execute(context.organization.id),
    ),

  create: baseProcedure({
    method: "POST",
    tags: ["Teams"],
  })
    .use(
      withPermissionsMiddleware({
        permissions: ["read:team", "create:team"],
      }),
    )
    .input(createTeamSchema)
    .handler(({ input, context }) =>
      createTeamUseCase.execute(context.organization.id, input),
    ),

  remove: baseProcedure({
    method: "DELETE",
    tags: ["Teams"],
  })
    .use(
      withPermissionsMiddleware({
        permissions: ["read:team", "delete:team"],
      }),
    )
    .input(removeManyTeamsSchema)
    .handler(({ input, context }) =>
      deleteTeamsUseCase.execute(context.organization.id, input),
    ),

  update: baseProcedure({
    method: "PUT",
    tags: ["Teams"],
  })
    .use(
      withPermissionsMiddleware({
        permissions: ["read:team", "update:team"],
      }),
    )
    .input(updateTeamSchema)
    .handler(({ input, context }) =>
      updateTeamUseCase.execute(context.organization.id, input),
    ),

  teamMembers: {
    create: baseProcedure({
      method: "POST",
      tags: ["Teams"],
    })
      .use(
        withPermissionsMiddleware({
          permissions: ["read:team", "update:team"],
        }),
      )
      .input(createTeamsMembersSchema)
      .handler(({ input, context }) =>
        createTeamsMembersUseCase.execute(context.organization.id, input),
      ),

    delete: baseProcedure({
      method: "POST",
      tags: ["Teams"],
    })
      .use(
        withPermissionsMiddleware({
          permissions: ["read:team", "update:team"],
        }),
      )
      .input(createTeamsMembersSchema)
      .handler(({ input, context }) =>
        deleteTeamsMembersUseCase.execute(context.organization.id, input),
      ),
  },
};
