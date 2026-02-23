import type { IncomingHttpHeaders } from "node:http";
import { WithAuthHeader } from "@fludge/api/modules/shared/usecases/with-auth-headers";
import type { AssignTeamsToEmployeeSchema } from "@fludge/utils/validators/employees.schemas";
import { auth } from "@fludge/auth";
import { tryCatch } from "@fludge/utils/try-catch";
import { InternalServerErrorException } from "@fludge/api/modules/shared/exceptions/internal-server-error.exception";

export class RemoveTeamsFromEmployeeUseCase extends WithAuthHeader {
  public static instance: RemoveTeamsFromEmployeeUseCase;

  private constructor(nodeHeaders: IncomingHttpHeaders) {
    super(nodeHeaders);
  }

  public static getInstance(nodeHeaders: IncomingHttpHeaders) {
    if (!RemoveTeamsFromEmployeeUseCase.instance) {
      RemoveTeamsFromEmployeeUseCase.instance =
        new RemoveTeamsFromEmployeeUseCase(nodeHeaders);
    }
    return RemoveTeamsFromEmployeeUseCase.instance;
  }

  public async execute(values: AssignTeamsToEmployeeSchema) {
    const { userId, teamIds } = values;

    const assignPromise = teamIds.map((teamId) =>
      auth.api.removeTeamMember({
        headers: this.headers,
        body: { userId, teamId },
      }),
    );

    const { error } = await tryCatch(Promise.all(assignPromise));

    if (error) throw new InternalServerErrorException(error.message);
  }
}

export function removeTeamsFromEmployeeUseCase(
  nodeHeaders: IncomingHttpHeaders,
) {
  return RemoveTeamsFromEmployeeUseCase.getInstance(nodeHeaders);
}
