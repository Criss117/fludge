import type { IncomingHttpHeaders } from "node:http";
import { and, eq } from "drizzle-orm";
import { ORPCError } from "@orpc/client";
import { db } from "@fludge/db";
import { auth } from "@fludge/auth";
import { OrganizationAlreadyExistsException } from "../exceptions/organization-already-exists.exception";
import { slugify } from "@fludge/utils/slugify";
import { tryCatch } from "@fludge/utils/try-catch";
import { allPermissions } from "@fludge/auth/permissions";
import type { CreateOrganizationSchema } from "@fludge/utils/validators/organization.schema";
import { organization } from "@fludge/db/schema/auth";

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
      db
        .select()
        .from(organization)
        .where(
          and(
            eq(organization.slug, orgSlug),
            eq(organization.legalName, values.legalName),
          ),
        ),
    );

    if (!data?.status || error) throw new OrganizationAlreadyExistsException();

    const { data: createdOrg, error: createdOrgErr } = await tryCatch(
      auth.api.createOrganization({
        headers: this.headers,
        body: {
          slug: orgSlug,
          address: values.address,
          legalName: values.legalName,
          name: values.name,
          logo: values.logo,
          contactEmail: values.contactEmail,
          contactPhone: values.contactPhone,
        },
      }),
    );

    if (createdOrgErr || !createdOrg)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al crear la organizacion",
        cause: createdOrgErr,
      });

    const { data: createdTeam, error: createdTeamErr } = await tryCatch(
      auth.api.createTeam({
        body: {
          name: "Administradores",
          organizationId: createdOrg.id,
          permissions: allPermissions,
        },
      }),
    );

    if (createdTeamErr)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message:
          "La organizacion se ha creado correctamente pero no se pudo crear el equipo de administradores",
        cause: createdTeamErr,
      });

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
