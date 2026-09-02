import { ORPCError } from "@orpc/server";
import type { z } from "zod";
import type { OrganizationRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/organization.repository";
import type { OrganizationUniquenessValidator } from "../services/organization-uniqueness-validator.service";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { Slug } from "@fludge/utils/slugify";
import { OrganizationAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/organization-already-exists.exception";
import { updateOrganizationValidator } from "@fludge/utils/validators/organization.validators";

export const updateOrganizationCommand = updateOrganizationValidator;

type CMD = z.infer<typeof updateOrganizationCommand>;

export class UpdateOrganizationCommand {
  constructor(
    private readonly organizationUniquenessValidator: OrganizationUniquenessValidator,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  public async execute(activeOrganization: Organization, cmd: CMD) {
    const [uniqueness, errUniqueness] =
      await this.organizationUniquenessValidator.validateUniqueFields(
        {
          name: cmd.name,
          slug: cmd.name ? new Slug(cmd.name).toString() : undefined,
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
