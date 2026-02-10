import type { IncomingHttpHeaders } from "node:http";
import { WithAuthHeader } from "@fludge/api/modules/shared/usecases/with-auth-headers";
import { auth } from "@fludge/auth";

export class FindManyTeamsUseCase extends WithAuthHeader {
  public static instance: FindManyTeamsUseCase;

  private constructor(nodeHeaders: IncomingHttpHeaders) {
    super(nodeHeaders);
  }

  public static getInstance(nodeHeaders: IncomingHttpHeaders) {
    if (!FindManyTeamsUseCase.instance) {
      FindManyTeamsUseCase.instance = new FindManyTeamsUseCase(nodeHeaders);
    }
    return FindManyTeamsUseCase.instance;
  }

  public async execute() {
    const teams = await auth.api.listOrganizationTeams({
      headers: this.headers,
    });

    return teams;
  }
}

export function findManyTeamsUseCase(nodeHeaders: IncomingHttpHeaders) {
  return FindManyTeamsUseCase.getInstance(nodeHeaders);
}
