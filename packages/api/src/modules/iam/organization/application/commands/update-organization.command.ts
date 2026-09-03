import type { z } from "zod";
import type { OrganizationRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/organization.repository";
import type { OrganizationUniquenessValidator } from "../services/organization-uniqueness-validator.service";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { Slug } from "@fludge/utils/slugify";
import { OrganizationAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/organization-already-exists.exception";
import { updateOrganizationValidator } from "@fludge/utils/validators/organization.validators";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";

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
        "iam.organizations.errors.isr_on_find",
      );

    if (uniqueness.nameTaken || uniqueness.slugTaken)
      throw new OrganizationAlreadyExistsException(
        "iam.organizations.errors.name_taken",
      );

    if (uniqueness.legalNameTaken)
      throw new OrganizationAlreadyExistsException(
        "iam.organizations.errors.legal_name_taken",
      );

    activeOrganization.update(cmd);

    const [, errSaving] =
      await this.organizationRepository.saveOnlyOrganization(
        activeOrganization,
      );

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "iam.organizations.errors.isr_on_save",
      );

    return activeOrganization.values;
  }
}
