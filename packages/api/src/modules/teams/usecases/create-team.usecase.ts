import { and, eq } from "drizzle-orm";
import type { CreateTeamSchema } from "@fludge/utils/validators/team.schemas";
import { db } from "@fludge/db";
import { team } from "@fludge/db/schema/auth";
import { TeamAlreadyExistsException } from "../exceptions/team-already-exists.exception";
import { tryCatch } from "@fludge/utils/try-catch";
import { InternalServerErrorException } from "@fludge/api/modules/shared/exceptions/internal-server-error.exception";
import { auth } from "@fludge/auth";

export class CreateTeamUseCase {
  public static instance: CreateTeamUseCase;

  private constructor() {}

  public static getInstance() {
    if (!CreateTeamUseCase.instance) {
      CreateTeamUseCase.instance = new CreateTeamUseCase();
    }
    return CreateTeamUseCase.instance;
  }

  public async execute(organizationId: string, values: CreateTeamSchema) {
    const { data: existingTeams, error: existingTeamError } = await tryCatch(
      db
        .select({ id: team.id })
        .from(team)
        .where(
          and(
            eq(team.name, values.name),
            eq(team.organizationId, organizationId),
          ),
        )
        .limit(1),
    );

    if (existingTeamError)
      throw new InternalServerErrorException(
        "Ocurrio un error al crear el equipo",
      );

    if (existingTeams.length > 0) throw new TeamAlreadyExistsException();

    const { data: createdTeam, error: createTeamError } = await tryCatch(
      auth.api.createTeam({
        body: {
          name: values.name,
          permissions: values.permissions,
          description: values.description,
          organizationId,
        },
      }),
    );

    if (createTeamError)
      throw new InternalServerErrorException(
        "Ocurrio un error al crear el equipo",
      );

    return createdTeam;
  }
}

export function createTeamUseCase() {
  return CreateTeamUseCase.getInstance();
}
