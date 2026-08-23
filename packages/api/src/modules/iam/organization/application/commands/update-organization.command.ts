import { z } from "zod";
import { registerOrganizationCommand } from "./register-organization.commad";
import type { PgOrganizationRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-organization.repository";
import { ORPCError } from "@orpc/server";
import type { OrganizationUniquenessValidator } from "../services/organization-uniqueness-validator.service";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { Slug } from "@fludge/utils/slugify";

export const updateOrganizationCommand = registerOrganizationCommand.partial();

type CMD = z.infer<typeof updateOrganizationCommand>;
export class UpdateOrganizationCommand {
  constructor(
    private readonly organizationRepository: PgOrganizationRepository,
    private readonly organizationUniquenessValidator: OrganizationUniquenessValidator,
  ) {}

  public async execute(activeOrganization: Organization, cmd: CMD) {
    const [uniqueness, errUniqueness] =
      await this.organizationUniquenessValidator.validateUniqueFields(
        {
          name: cmd.name,
          slug: cmd.name ? new Slug(cmd.name).toString() : undefined,
          legalName: cmd.legalName,
          taxId: cmd.taxId,
        },
        activeOrganization.id.toString(),
      );

    if (errUniqueness)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al validar la unicidad de la organización",
        cause: errUniqueness.cause,
      });

    if (uniqueness.nameTaken)
      throw new ORPCError("CONFLICT", {
        message: "El nombre ya está en uso",
      });

    if (uniqueness.slugTaken)
      throw new ORPCError("CONFLICT", {
        message: "El slug ya está en uso",
      });

    if (uniqueness.legalNameTaken)
      throw new ORPCError("CONFLICT", {
        message: "El nombre legal ya está en uso",
      });

    if (uniqueness.taxIdTaken)
      throw new ORPCError("CONFLICT", {
        message: "El TAX ID ya está en uso",
      });

    if (uniqueness.phoneTaken)
      throw new ORPCError("CONFLICT", {
        message: "El teléfono ya está en uso",
      });

    activeOrganization.update(cmd);

    const [, errSaving] = await this.organizationRepository.save(
      activeOrganization,
      {
        onlySave: ["organization"],
      },
    );

    if (errSaving)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al guardar la organización",
        cause: errSaving.cause,
      });

    return activeOrganization.values;
  }
}
