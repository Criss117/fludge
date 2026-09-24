import type { z } from "zod";
import type { OrganizationUniquenessValidator } from "@fludge/api/core/iam/application/services/organization-uniqueness-validator.service";
import { OrganizationAlreadyExistsException } from "@fludge/api/core/iam/domain/exceptions/organization-already-exists.exception";
import { OrganizationNotFoundException } from "@fludge/api/core/iam/domain/exceptions/organization-not-found.exception";
import type { OrganizationRepository } from "@fludge/api/core/iam/domain/repositories/organization.repository";
import { InternalServerError } from "../../../shared/exceptions/base-exception";
import { Slug } from "@fludge/utils/slugify";
import { updateOrganizationValidator } from "@fludge/utils/validators/organization.validators";

export const updateOrganizationCommand = updateOrganizationValidator;

type CMD = z.infer<typeof updateOrganizationCommand>;

export class UpdateOrganizationCommand {
  constructor(
    private readonly organizationUniquenessValidator: OrganizationUniquenessValidator,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  public async execute(activeOrganizationId: string, cmd: CMD) {
    const [activeOrganization, errOrganization] =
      await this.organizationRepository.findById(activeOrganizationId);

    if (errOrganization)
      throw new InternalServerError(
        errOrganization,
        "api_errors.iam.organizations.isr_on_find",
      );

    if (!activeOrganization) throw new OrganizationNotFoundException();

    const [uniqueness, errUniqueness] =
      await this.organizationUniquenessValidator.validateUniqueFields(
        {
          name: cmd.name,
          slug: cmd.name ? new Slug(cmd.name).toString() : undefined,
        },
        activeOrganization.id.toString(),
      );

    if (errUniqueness)
      throw new InternalServerError(
        errUniqueness,
        "api_errors.iam.organizations.isr_on_find",
      );

    if (uniqueness.nameTaken || uniqueness.slugTaken)
      throw new OrganizationAlreadyExistsException(
        "api_errors.iam.organizations.name_taken",
      );

    activeOrganization.update(cmd);

    const [, errSaving] =
      await this.organizationRepository.update(activeOrganization);

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "api_errors.iam.organizations.isr_on_save",
      );

    return activeOrganization.values;
  }
}
