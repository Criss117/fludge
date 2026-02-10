import type { IncomingHttpHeaders } from "node:http";
import { ORPCError } from "@orpc/client";
import { WithAuthHeader } from "@fludge/api/modules/shared/usecases/with-auth-headers";
import { tryCatch } from "@fludge/utils/try-catch";
import { auth } from "@fludge/auth";
import type { RemoveManyTeamsSchema } from "@fludge/utils/validators/team.schemas";

export class DeleteTeamsUseCase extends WithAuthHeader {
  public static instance: DeleteTeamsUseCase;

  private constructor(nodeHeaders: IncomingHttpHeaders) {
    super(nodeHeaders);
  }

  public static getInstance(nodeHeaders: IncomingHttpHeaders) {
    if (!DeleteTeamsUseCase.instance) {
      DeleteTeamsUseCase.instance = new DeleteTeamsUseCase(nodeHeaders);
    }
    return DeleteTeamsUseCase.instance;
  }

  public async execute(values: RemoveManyTeamsSchema) {
    const removeTeamsPromise = Promise.all(
      values.ids.map((teamId) =>
        auth.api.removeTeam({ body: { teamId }, headers: this.headers }),
      ),
    );

    const { data, error } = await tryCatch(removeTeamsPromise);

    if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    return data.filter((team) => team !== null);
  }
}

export function deleteTeamsUseCase(nodeHeaders: IncomingHttpHeaders) {
  return DeleteTeamsUseCase.getInstance(nodeHeaders);
}
