import type { IncomingHttpHeaders } from "node:http";
import { WithAuthHeader } from "@fludge/api/modules/shared/usecases/with-auth-headers";
import type { AssignEmployeesToTeamSchema } from "@fludge/utils/validators/team.schemas";
import { auth } from "@fludge/auth";
import { tryCatch } from "@fludge/utils/try-catch";
import { InternalServerErrorException } from "@fludge/api/modules/shared/exceptions/internal-server-error.exception";

export class AssignEmployeesToTeamUseCase extends WithAuthHeader {
  constructor(nodeHeaders: IncomingHttpHeaders) {
    super(nodeHeaders);
  }

  public async execute(values: AssignEmployeesToTeamSchema) {
    const { teamId, userIds } = values;

    const assignPromise = userIds.map((userId) =>
      auth.api.addTeamMember({
        headers: this.headers,
        body: { userId, teamId },
      }),
    );

    const { error } = await tryCatch(Promise.all(assignPromise));

    if (error) throw new InternalServerErrorException(error.message);
  }
}

export function assingEmployeesToTeamUseCase(nodeHeaders: IncomingHttpHeaders) {
  return new AssignEmployeesToTeamUseCase(nodeHeaders);
}
