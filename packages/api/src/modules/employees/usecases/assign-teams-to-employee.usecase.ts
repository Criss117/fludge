import type { IncomingHttpHeaders } from "node:http";
import { WithAuthHeader } from "@fludge/api/modules/shared/usecases/with-auth-headers";
import type { AssignTeamsToEmployeeSchema } from "@fludge/utils/validators/employees.schemas";
import { auth } from "@fludge/auth";
import { tryCatch } from "@fludge/utils/try-catch";
import { InternalServerErrorException } from "@fludge/api/modules/shared/exceptions/internal-server-error.exception";

export class AssignTeamsToEmployeeUseCase extends WithAuthHeader {
  constructor(nodeHeaders: IncomingHttpHeaders) {
    super(nodeHeaders);
  }

  public async execute(values: AssignTeamsToEmployeeSchema) {
    const { userId, teamIds } = values;

    const assignPromise = teamIds.map((teamId) =>
      auth.api.addTeamMember({
        headers: this.headers,
        body: { userId, teamId },
      }),
    );

    const { error } = await tryCatch(Promise.all(assignPromise));

    if (error) throw new InternalServerErrorException(error.message);
  }
}

export function assignTeamsToEmployeeUseCase(nodeHeaders: IncomingHttpHeaders) {
  return new AssignTeamsToEmployeeUseCase(nodeHeaders);
}
