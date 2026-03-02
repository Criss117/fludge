import { and, eq, inArray } from "drizzle-orm";
import { tryCatch } from "@fludge/utils/try-catch";
import type { RemoveManyTeamsSchema } from "@fludge/utils/validators/team.schemas";
import { InternalServerErrorException } from "../../shared/exceptions/internal-server-error.exception";
import { db } from "@fludge/db";
import { team } from "@fludge/db/schema/organization";

export class DeleteTeamsUseCase {
  public async execute(organizationId: string, values: RemoveManyTeamsSchema) {
    const { error } = await tryCatch(
      db
        .delete(team)
        .where(
          and(
            eq(team.organizationId, organizationId),
            inArray(team.id, values.ids),
          ),
        ),
    );

    if (error)
      throw new InternalServerErrorException(
        "Hubo un error al eliminar los equipos",
      );
  }
}

export const deleteTeamsUseCase = new DeleteTeamsUseCase();
