import type { IncomingHttpHeaders } from "node:http";
import { ORPCError } from "@orpc/client";
import { auth } from "@fludge/auth";
import { OrganizationAlreadyExistsException } from "../exceptions/organization-already-exists.exception";
import { slugify } from "@fludge/utils/slugify";
import { tryCatch } from "@fludge/utils/try-catch";
import { allPermissions } from "@fludge/auth/permissions";
import type { CreateOrganizationSchema } from "../schemas/create-organization.schema";

export class CreateOrganizationUseCase {
  private static instance: CreateOrganizationUseCase;

  private constructor(private readonly headers: IncomingHttpHeaders) {}

  static getInstance(headers: IncomingHttpHeaders): CreateOrganizationUseCase {
    if (!CreateOrganizationUseCase.instance) {
      CreateOrganizationUseCase.instance = new CreateOrganizationUseCase(
        headers,
      );
    }
    return CreateOrganizationUseCase.instance;
  }

  async execute(values: CreateOrganizationSchema) {
    const orgSlug = slugify(values.name);

    const { data, error } = await tryCatch(
      auth.api.checkOrganizationSlug({
        body: {
          slug: orgSlug,
        },
      }),
    );

    if (!data?.status || error) throw new OrganizationAlreadyExistsException();

    const { data: createdOrg, error: createdOrgErr } = await tryCatch(
      auth.api.createOrganization({
        headers: this.headers,
        body: {
          slug: orgSlug,
          ...values,
        },
      }),
    );

    if (createdOrgErr || !createdOrg)
      throw new ORPCError("INTERNAL_SERVER_ERROR");

    const { data: createdTeam, error: createdTeamErr } = await tryCatch(
      auth.api.createTeam({
        body: {
          name: "Administradores",
          organizationId: createdOrg.id,
          permissions: allPermissions,
        },
      }),
    );

    if (createdTeamErr || !createdTeam)
      throw new ORPCError("INTERNAL_SERVER_ERROR");

    return {
      ...createdOrg,
      teams: [createdTeam],
    };
  }
}

export function createOrganizationUseCase(
  headers: IncomingHttpHeaders,
): CreateOrganizationUseCase {
  return CreateOrganizationUseCase.getInstance(headers);
}
