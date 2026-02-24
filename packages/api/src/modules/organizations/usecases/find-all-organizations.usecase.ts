import type { IncomingHttpHeaders } from "node:http";
import { auth } from "@fludge/auth";
import { tryCatch } from "@fludge/utils/try-catch";
import { WithAuthHeader } from "@fludge/api/modules/shared/usecases/with-auth-headers";

export class FindAllOrganizationUseCase extends WithAuthHeader {
  constructor(nodeHeaders: IncomingHttpHeaders) {
    super(nodeHeaders);
  }

  async execute() {
    const { data: organizations, error: organizationsError } = await tryCatch(
      auth.api.listOrganizations({
        headers: this.headers,
      }),
    );

    if (organizationsError || organizations.length === 0) return null;

    return organizations;
  }
}

export function findAllOrganizationsUseCase(headers: IncomingHttpHeaders) {
  return new FindAllOrganizationUseCase(headers);
}
