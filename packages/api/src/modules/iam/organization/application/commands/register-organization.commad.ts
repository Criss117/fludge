import type { z } from "zod";
import type { OrganizationUniquenessValidator } from "@fludge/api/modules/iam/organization/application/services/organization-uniqueness-validator.service";
import type { OrganizationRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/organization.repository";
import { ORPCError } from "@orpc/server";
import { Group } from "@fludge/api/modules/iam/organization/domain/entities/group.entity";
import { Permissions } from "@fludge/utils/permissions/index";
import { UUID } from "@fludge/utils/uuid";
import { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { OrganizationAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/organization-already-exists.exception";
import { ALL_PERMISSIONS } from "@fludge/utils/permissions/data";
import { registerOrganizationValidator } from "@fludge/utils/validators/organization.validators";

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
        permissions: Permissions.create(ALL_PERMISSIONS),
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
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al validar la unicidad de la organización",
        cause: errUniqueness.cause,
      });

    if (uniqueness.nameTaken || uniqueness.slugTaken)
      throw new OrganizationAlreadyExistsException(
        "El nombre o el slug ya está en uso",
      );

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

    const [, errSaving] = await this.organizationRepository.save(organization);

    if (errSaving)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al guardar la organización",
        cause: errSaving.cause,
      });

    return organization.values;
  }
}
