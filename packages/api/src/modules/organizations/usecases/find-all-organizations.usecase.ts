import type { IncomingHttpHeaders } from "node:http";
import { auth } from "@fludge/auth";
import { tryCatch } from "@fludge/utils/try-catch";
import { fromNodeHeaders } from "better-auth/node";

export class FindAllOrganizationUseCase {
  private static instance: FindAllOrganizationUseCase;
  private headers: Headers;

  private constructor(nodeHeaders: IncomingHttpHeaders) {
    this.headers = fromNodeHeaders(nodeHeaders);
  }

  static getInstance(headers: IncomingHttpHeaders): FindAllOrganizationUseCase {
    if (!FindAllOrganizationUseCase.instance) {
      FindAllOrganizationUseCase.instance = new FindAllOrganizationUseCase(
        headers,
      );
    }
    return FindAllOrganizationUseCase.instance;
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

export function findAllOrganizationsUseCase(
  headers: IncomingHttpHeaders,
): FindAllOrganizationUseCase {
  return FindAllOrganizationUseCase.getInstance(headers);
}
