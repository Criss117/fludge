import type { z } from "zod";
import type { OrganizationUniquenessValidator } from "@core/iam/application/services/organization-uniqueness-validator.service";
import type { Organization } from "@core/iam/domain/entities/organization.entity";
import { OrganizationAlreadyExistsException } from "@core/iam/domain/exceptions/organization-already-exists.exception";
import type { OrganizationRepository } from "@core/iam/domain/repositories/organization.repository";
import { InternalServerError } from "@core/shared/exceptions/base-exception";
import { Slug } from "@fludge/utils/slugify";
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
