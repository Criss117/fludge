import { z } from "zod";
import { ORPCError } from "@orpc/server";
import type { PgOrganizationRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-organization.repository";
import { Group } from "@fludge/api/modules/iam/organization/domain/entities/group.entity";
import { Permissions } from "@fludge/utils/permissions/index";
import { UUID } from "@fludge/utils/uuid";
import { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import type { OrganizationUniquenessValidator } from "@fludge/api/modules/iam/organization/application/services/organization-uniqueness-validator.service";
import { OrganizationAlreadyExistsException } from "@fludge/api/modules/iam/organization/domain/exceptions/organization-already-exists.exception";
import { ALL_PERMISSIONS } from "@fludge/utils/permissions/data";

export const registerOrganizationCommand = z.object({
  name: z
    .string({
      error: "El nombre es requerido",
    })
    .min(3, {
      error: "El nombre es muy corto",
    })
    .max(50, {
      error: "El nombre es muy largo",
    }),
  phone: z
    .string({
      error: "El teléfono es requerido",
    })
    .min(9, {
      error: "El teléfono es muy corto",
    })
    .max(15, {
      error: "El teléfono es muy largo",
    }),
  legalName: z
    .string({
      error: "La razón social es requerida",
    })
    .min(3, {
      error: "La razón social es muy corta",
    })
    .max(50, {
      error: "La razón social es muy larga",
    }),
  taxId: z
    .string({
      error: "El NIT es requerido",
    })
    .min(9, {
      error: "El NIT es muy corto",
    })
    .max(15, {
      error: "El NIT es muy largo",
    }),
  address: z
    .string({
      error: "La dirección es requerida",
    })
    .min(5, {
      error: "La dirección es muy corta",
    })
    .max(50, {
      error: "La dirección es muy larga",
    }),
});

type CMD = z.infer<typeof registerOrganizationCommand>;

export class RegisterOrganizationCommand {
  constructor(
    private readonly organizationUniquenessValidator: OrganizationUniquenessValidator,
    private readonly organizationRepository: PgOrganizationRepository,
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
