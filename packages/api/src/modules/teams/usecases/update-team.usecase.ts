import { db } from "@fludge/db";
import { team } from "@fludge/db/schema/auth";
import { tryCatch } from "@fludge/utils/try-catch";
import type { UpdateTeamSchema } from "@fludge/utils/validators/team.schemas";
import { and, eq, sql } from "drizzle-orm";
import { InternalServerErrorException } from "@fludge/api/modules/shared/exceptions/internal-server-error.exception";
import { TeamNotFoundException } from "../exceptions/team-not-found.exception";
import { TeamAlreadyExistsException } from "../exceptions/team-already-exists.exception";
import { u } from "node_modules/@orpc/server/dist/shared/server.C8_sRzQB.mjs";

export class UpdateTeamUseCase {
  public static instance: UpdateTeamUseCase;

  private constructor() {}

  public static getInstance() {
    if (!UpdateTeamUseCase.instance) {
      UpdateTeamUseCase.instance = new UpdateTeamUseCase();
    }
    return UpdateTeamUseCase.instance;
  }

  public async execute(organizationId: string, values: UpdateTeamSchema) {
    const { data: existingTeams, error } = await tryCatch(
      db
        .select()
        .from(team)
        .where(
          and(eq(team.id, values.id), eq(team.organizationId, organizationId)),
        )
        .limit(1),
    );

    if (error)
      throw new InternalServerErrorException(
        "Hubo un error al obtener los datos del equipo.",
      );

    const existingTeam = existingTeams.at(0);

    if (!existingTeam) throw new TeamNotFoundException();

    if (values.name && existingTeam.name !== values.name) {
      const { data: existingTeamsSameName, error: errorExistingTeamsSameName } =
        await tryCatch(
          db
            .select({ id: team.id })
            .from(team)
            .where(
              and(
                sql`lower(${team.name}) = lower(${values.name})`,
                eq(team.organizationId, organizationId),
              ),
            )
            .limit(1),
        );

      if (errorExistingTeamsSameName)
        throw new InternalServerErrorException(
          "Hubo un error al obtener los datos del equipo.",
        );

      if (existingTeamsSameName.length > 0)
        throw new TeamAlreadyExistsException(
          "El nombre del equipo ya esta en uso.",
        );
    }

    const { data: updatedTeams, error: errorUpadatedTeam } = await tryCatch(
      db
        .update(team)
        .set({
          name: values.name ?? existingTeam.name,
          description: values.description,
          permissions: Array.from(
            new Set(values.permissions ?? existingTeam.permissions),
          ),
        })
        .where(
          and(eq(team.id, values.id), eq(team.organizationId, organizationId)),
        )
        .returning(),
    );

    if (errorUpadatedTeam)
      throw new InternalServerErrorException(
        "Hubo un error al actualizar los datos del equipo",
      );
    const updatedTeam = updatedTeams.at(0);

    if (!updatedTeam)
      throw new InternalServerErrorException(
        "Hubo un error al actualizar los datos del equipo",
      );

    return updatedTeam;
  }
}

export function updateTeamUseCase() {
  return UpdateTeamUseCase.getInstance();
}
