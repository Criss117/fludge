import { db } from "@fludge/db";
import { team, teamMember, user } from "@fludge/db/schema/auth";
import { tryCatch } from "@fludge/utils/try-catch";
import type { CreateTeamsMembersSchema } from "@fludge/utils/validators/team.schemas";
import { and, eq, inArray } from "drizzle-orm";
import { InternalServerErrorException } from "../../shared/exceptions/internal-server-error.exception";
import { TeamNotFoundException } from "../exceptions/team-not-found.exception";

export class CreateTeamsMembersUseCase {
  public async execute(
    organizationId: string,
    values: CreateTeamsMembersSchema,
  ) {
    const uniqueTeamsIds = Array.from(
      new Set(values.map((value) => value.teamId)),
    );

    const uniqueUserIds = Array.from(
      new Set(values.map((value) => value.userId)),
    );

    const findTeamsPromise = db
      .select({ id: team.id })
      .from(team)
      .where(
        and(
          eq(team.organizationId, organizationId),
          inArray(team.id, uniqueTeamsIds),
        ),
      );

    //TODO: validar que los usuarios sean miembros de la organizacion
    const findUsers = db
      .select({ id: user.id })
      .from(user)
      .where(inArray(user.id, uniqueUserIds));

    const { data, error } = await tryCatch(
      Promise.all([findTeamsPromise, findUsers]),
    );

    if (error)
      throw new InternalServerErrorException(
        "Algo salió mal al buscar usuarios y equipos",
      );

    const [teams, users] = data;

    if (
      teams.length !== uniqueTeamsIds.length ||
      users.length !== uniqueUserIds.length
    )
      throw new TeamNotFoundException("No se encontraron equipos o usuarios");

    const { data: insertReturn, error: insertError } = await tryCatch(
      db.insert(teamMember).values(values).returning(),
    );

    if (insertError)
      throw new InternalServerErrorException(
        "Algo salió mal al crear miembros de equipos",
      );

    return insertReturn;
  }
}

export const createTeamsMembersUseCase = new CreateTeamsMembersUseCase();
