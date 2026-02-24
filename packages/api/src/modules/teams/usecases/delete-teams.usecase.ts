import { auth } from "@fludge/auth";
import { tryCatch } from "@fludge/utils/try-catch";
import type { RemoveManyTeamsSchema } from "@fludge/utils/validators/team.schemas";
import { InternalServerErrorException } from "../../shared/exceptions/internal-server-error.exception";

export class DeleteTeamsUseCase {
  public async execute(organizationId: string, values: RemoveManyTeamsSchema) {
    const removeTeamsPromise = Promise.all(
      values.ids.map((teamId) =>
        auth.api.removeTeam({ body: { teamId, organizationId } }),
      ),
    );

    const { data, error } = await tryCatch(removeTeamsPromise);

    if (error)
      throw new InternalServerErrorException(
        "Hubo un error al eliminar los equipos",
      );

    return data.filter((team) => team !== null);
  }
}

export const deleteTeamsUseCase = new DeleteTeamsUseCase();
