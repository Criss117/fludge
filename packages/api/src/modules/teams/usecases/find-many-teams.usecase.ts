import { eq, getTableColumns, sql } from "drizzle-orm";
import { db } from "@fludge/db";
import { team, teamMember, user } from "@fludge/db/schema/auth";
import { tryCatch } from "@fludge/utils/try-catch";
import { InternalServerErrorException } from "../../shared/exceptions/internal-server-error.exception";
import { parseUsersOnTeamSchema } from "@fludge/utils/validators/team.schemas";

export class FindManyTeamsUseCase {
  public static instance: FindManyTeamsUseCase;

  private constructor() {}

  public static getInstance() {
    if (!FindManyTeamsUseCase.instance) {
      FindManyTeamsUseCase.instance = new FindManyTeamsUseCase();
    }
    return FindManyTeamsUseCase.instance;
  }

  public async execute(organizationId: string) {
    const { data: teams, error } = await tryCatch(
      db
        .select({
          ...getTableColumns(team),
          users: sql<string>`
            JSON_GROUP_ARRAY(
              JSON_OBJECT(
                'id', ${user.id},
                'name', ${user.name}
              )
            )
          `,
        })
        .from(team)
        .leftJoin(teamMember, eq(teamMember.teamId, team.id))
        .leftJoin(user, eq(user.id, teamMember.userId))
        .where(eq(team.organizationId, organizationId))
        .groupBy(team.id),
    );

    if (error)
      throw new InternalServerErrorException(
        "Hubo un error al buscar los equipos",
      );

    return teams.map((team) => {
      const obj = JSON.parse(team.users);

      const parsedUsers = parseUsersOnTeamSchema.safeParse(obj);

      return {
        ...team,
        users: parsedUsers.success ? parsedUsers.data : [],
      };
    });
  }
}

export function findManyTeamsUseCase() {
  return FindManyTeamsUseCase.getInstance();
}
