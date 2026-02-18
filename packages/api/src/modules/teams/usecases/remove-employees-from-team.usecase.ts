import type { IncomingHttpHeaders } from "node:http";
import { auth } from "@fludge/auth";
import { tryCatch } from "@fludge/utils/try-catch";
import { WithAuthHeader } from "@fludge/api/modules/shared/usecases/with-auth-headers";
import { InternalServerErrorException } from "@fludge/api/modules/shared/exceptions/internal-server-error.exception";
import type { AssignEmployeesToTeamSchema } from "@fludge/utils/validators/team.schemas";

export class RemoveEmployeesFromTeamUseCase extends WithAuthHeader {
  public static instance: RemoveEmployeesFromTeamUseCase;

  private constructor(nodeHeaders: IncomingHttpHeaders) {
    super(nodeHeaders);
  }

  public static getInstance(nodeHeaders: IncomingHttpHeaders) {
    if (!RemoveEmployeesFromTeamUseCase.instance) {
      RemoveEmployeesFromTeamUseCase.instance =
        new RemoveEmployeesFromTeamUseCase(nodeHeaders);
    }
    return RemoveEmployeesFromTeamUseCase.instance;
  }

  public async execute(values: AssignEmployeesToTeamSchema) {
    const { teamId, employeeIds } = values;

    const assingPromise = employeeIds.map((employeeId) =>
      auth.api.removeTeamMember({
        headers: this.headers,
        body: { userId: employeeId, teamId },
      }),
    );

    const { error } = await tryCatch(Promise.all(assingPromise));

    if (error) throw new InternalServerErrorException(error.message);
  }
}

export function removeEmployeesFromTeamUseCase(
  nodeHeaders: IncomingHttpHeaders,
) {
  return RemoveEmployeesFromTeamUseCase.getInstance(nodeHeaders);
}
