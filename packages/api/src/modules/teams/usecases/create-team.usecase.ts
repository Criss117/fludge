import { and, eq } from "drizzle-orm";
import type { CreateTeamSchema } from "@fludge/utils/validators/team.schemas";
import { db } from "@fludge/db";
import { team } from "@fludge/db/schema/auth";
import { TeamAlreadyExistsException } from "../exceptions/team-already-exists.exception";
import { tryCatch } from "@fludge/utils/try-catch";
import { InternalServerErrorException } from "@fludge/api/modules/shared/exceptions/internal-server-error.exception";

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

    const { data: createdTeams, error: createTeamError } = await tryCatch(
      db
        .insert(team)
        .values({
          name: values.name,
          permissions: values.permissions,
          description: values.description,
          organizationId,
          createdAt: new Date(),
        })
        .returning(),
    );

    if (createTeamError)
      throw new InternalServerErrorException(
        "Ocurrio un error al crear el equipo",
      );

    const createdTeam = createdTeams.at(0);

    if (!createdTeam)
      throw new InternalServerErrorException(
        "Ocurrio un error al crear el equipo",
      );

    return createdTeam;
  }
}

export function createTeamUseCase() {
  return CreateTeamUseCase.getInstance();
}
