import { eq, or } from "drizzle-orm";
import { db } from "@fludge/db";
import { OrganizationAlreadyExistsException } from "../exceptions/organization-already-exists.exception";
import { slugify } from "@fludge/utils/slugify";
import { tryCatch } from "@fludge/utils/try-catch";
import { allPermissions } from "@fludge/utils/validators/permission.schemas";
import type { CreateOrganizationSchema } from "@fludge/utils/validators/organization.schema";
import { organization, team } from "@fludge/db/schema/organization";
import { InternalServerErrorException } from "../../shared/exceptions/internal-server-error.exception";

export class CreateOrganizationUseCase {
  async execute(rootUserId: string, values: CreateOrganizationSchema) {
    const orgSlug = slugify(values.name);

    const { data, error } = await tryCatch(
      db
        .select({
          id: organization.id,
        })
        .from(organization)
        .where(
          or(
            eq(organization.slug, orgSlug),
            eq(organization.legalName, values.legalName),
          ),
        )
        .limit(1),
    );

    if (error || data.length > 0)
      throw new OrganizationAlreadyExistsException();

    const { data: createdOrgs, error: createdOrgErr } = await tryCatch(
      db
        .insert(organization)
        .values({
          ...values,
          rootUserId,
          slug: orgSlug,
        })
        .returning(),
    );

    if (createdOrgErr)
      throw new InternalServerErrorException(
        "Algo salió mal al crear la organización",
      );

    const createdOrg = createdOrgs.at(0);

    if (!createdOrg)
      throw new InternalServerErrorException(
        "Algo salió mal al crear la organización",
      );

    const { data: createdTeams, error: createdTeamErr } = await tryCatch(
      db
        .insert(team)
        .values({
          name: "Administradores",
          organizationId: createdOrg.id,
          permissions: allPermissions,
          createdAt: new Date(),
          description:
            "Acceso total al sistema. Gestiona todos los recursos y configuraciones del POS.",
        })
        .returning(),
    );

    if (createdTeamErr)
      throw new InternalServerErrorException(
        "Algo salió mal al crear el equipo de administradores",
      );

    return {
      ...createdOrg,
      teams: createdTeams,
    };
  }
}

export const createOrganizationUseCase = new CreateOrganizationUseCase();
