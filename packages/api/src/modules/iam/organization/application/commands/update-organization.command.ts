import { z } from "zod";
import { registerOrganizationCommand } from "./register-organization.commad";
import type { PgOrganizationRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-organization.repository";
import { ORPCError } from "@orpc/server";
import type { OrganizationUniquenessValidator } from "../services/organization-uniqueness-validator.service";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { Slug } from "@fludge/utils/slugify";
import { OrganizationAlreadyExistsException } from "../../domain/exceptions/organization-already-exists.exception";

export const updateOrganizationCommand = registerOrganizationCommand.partial();

type CMD = z.infer<typeof updateOrganizationCommand>;
export class UpdateOrganizationCommand {
  constructor(
    private readonly organizationUniquenessValidator: OrganizationUniquenessValidator,
    private readonly organizationRepository: PgOrganizationRepository,
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
      throw new OrganizationAlreadyExistsException("El nombre ya está en uso");

    if (uniqueness.slugTaken)
      throw new OrganizationAlreadyExistsException("El slug ya está en uso");

    if (uniqueness.legalNameTaken)
      throw new OrganizationAlreadyExistsException(
        "El nombre legal ya está en uso",
      );

    if (uniqueness.taxIdTaken)
      throw new OrganizationAlreadyExistsException("El TAX ID ya está en uso");

    if (uniqueness.phoneTaken)
      throw new OrganizationAlreadyExistsException(
        "El teléfono ya está en uso",
      );

    activeOrganization.update(cmd);

    const [, errSaving] =
      await this.organizationRepository.saveOnlyOrganization(
        activeOrganization,
      );

    if (errSaving)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al guardar la organización",
        cause: errSaving.cause,
      });

    return activeOrganization.values;
  }
}
