import type { IncomingHttpHeaders } from "node:http";
import { auth } from "@fludge/auth";
import { tryCatch } from "@fludge/utils/try-catch";

export class FindAllOrganizationUseCase {
  private static instance: FindAllOrganizationUseCase;

  private constructor(private readonly headers: IncomingHttpHeaders) {}

  static getInstance(headers: IncomingHttpHeaders): FindAllOrganizationUseCase {
    if (!FindAllOrganizationUseCase.instance) {
      FindAllOrganizationUseCase.instance = new FindAllOrganizationUseCase(
        headers,
      );
    }
    return FindAllOrganizationUseCase.instance;
  }

  async execute() {
    const { data: orgs, error: orgsError } = await tryCatch(
      auth.api.listOrganizations({
        headers: this.headers,
      }),
    );

    if (orgsError || orgs.length === 0) return null;

    return orgs;
  }
}

export function findAllOrganizationsUseCase(
  headers: IncomingHttpHeaders,
): FindAllOrganizationUseCase {
  return FindAllOrganizationUseCase.getInstance(headers);
}
