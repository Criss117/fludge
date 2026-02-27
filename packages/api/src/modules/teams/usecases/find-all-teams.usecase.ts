import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@fludge/db";
import { team, teamMember } from "@fludge/db/schema/auth";
import { tryCatch } from "@fludge/utils/try-catch";
import { InternalServerErrorException } from "../../shared/exceptions/internal-server-error.exception";

export class FindAllTeamsUseCase {
  public async execute(organizationId: string) {
    const { data: teams, error } = await tryCatch(
      db
        .select()
        .from(team)
        .where(eq(team.organizationId, organizationId))
        .orderBy(desc(team.createdAt)),
    );

    if (error)
      throw new InternalServerErrorException(
        "Hubo un error al buscar los equipos",
      );

    const { data: teamsMembers, error: teamsMembersError } = await tryCatch(
      db
        .select()
        .from(teamMember)
        .where(
          inArray(
            teamMember.teamId,
            teams.map((t) => t.id),
          ),
        )
        .orderBy(desc(teamMember.createdAt)),
    );

    if (teamsMembersError)
      throw new InternalServerErrorException(
        "Hubo un error al buscar los equipos",
      );

    return {
      teamsMembers,
      teams,
    };
  }
}

export const findAllTeamsUseCase = new FindAllTeamsUseCase();
