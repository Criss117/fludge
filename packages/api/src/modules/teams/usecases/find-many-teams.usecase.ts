import { eq } from "drizzle-orm";
import { db } from "@fludge/db";
import { team } from "@fludge/db/schema/auth";
import { tryCatch } from "@fludge/utils/try-catch";
import { InternalServerErrorException } from "../../shared/exceptions/internal-server-error.exception";

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
      db.select().from(team).where(eq(team.organizationId, organizationId)),
    );

    console.log(teams);

    if (error)
      throw new InternalServerErrorException(
        "Hubo un error al buscar los equipos",
      );

    return teams;
  }
}

export function findManyTeamsUseCase() {
  return FindManyTeamsUseCase.getInstance();
}
