import type { z } from "zod";
import type { OrganizationUniquenessValidator } from "@fludge/api/modules/iam/organization/application/services/organization-uniqueness-validator.service";
import type { OrganizationRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/organization.repository";
import { Group } from "@fludge/api/modules/iam/organization/domain/entities/group.entity";
import { Permissions } from "@fludge/utils/permissions/index";
import { UUID } from "@fludge/utils/uuid";
import { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { OrganizationAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/organization-already-exists.exception";
import { registerOrganizationValidator } from "@fludge/utils/validators/organization.validators";
import { PERMISSIONS } from "@fludge/utils/permissions/data";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";

export const registerOrganizationCommand = registerOrganizationValidator;

type CMD = z.infer<typeof registerOrganizationCommand>;

export class RegisterOrganizationCommand {
  constructor(
    private readonly organizationUniquenessValidator: OrganizationUniquenessValidator,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  public async execute(rootUserId: string, cmd: CMD) {
    const organization = Organization.create({
      legalName: cmd.legalName,
      name: cmd.name,
      phone: cmd.phone,
      taxId: cmd.taxId,
      address: cmd.address,
      owner: {
        userId: UUID.fromString(rootUserId),
        role: "owner",
        assignedBy: null,
      },
    });

    const ownerMember = organization.members.owner!;

    organization.groups.addGroup(
      Group.create({
        name: "Administradores",
        description: "Grupo de administradores",
        permissions: Permissions.fromRecord(PERMISSIONS),
        createdBy: ownerMember.id,
      }),
    );

    const [uniqueness, errUniqueness] =
      await this.organizationUniquenessValidator.validateUniqueFields({
        legalName: organization.values.legalName,
        name: organization.values.name,
        phone: organization.values.phone,
        taxId: organization.values.taxId,
        slug: organization.values.slug,
      });

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

    if (uniqueness.taxIdTaken)
      throw new OrganizationAlreadyExistsException(
        "iam.organizations.errors.tax_id_taken",
      );

    if (uniqueness.phoneTaken)
      throw new OrganizationAlreadyExistsException(
        "iam.organizations.errors.phone_taken",
      );

    const [, errSaving] = await this.organizationRepository.save(organization);

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "iam.organizations.errors.isr_on_save",
      );

    return organization.values;
  }
}
