import { z } from "zod";
import { ORPCError } from "@orpc/client";
import type { PgOrganizationRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-organization.repository";
import { Group } from "@fludge/api/modules/iam/organization/domain/entities/group";
import { allPermissions, Permissions } from "@fludge/utils/permissions";
import { UUID } from "@fludge/utils/uuid";
import { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization";
import { Member } from "@fludge/api/modules/iam/organization/domain/entities/members";

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
    private readonly organizationRepository: PgOrganizationRepository,
  ) {}

  public async execute(rootUserId: string, cmd: CMD) {
    const organization = Organization.create({
      legalName: cmd.legalName,
      name: cmd.name,
      phone: cmd.phone,
      taxId: cmd.taxId,
      address: cmd.address,
    });

    const ownerMember = Member.create({
      userId: UUID.fromString(rootUserId),
      role: "owner",
      assignedBy: null,
    });

    organization.addMember(ownerMember);

    organization.addGroup(
      Group.create({
        name: "Administradores",
        description: "Grupo de administradores",
        permissions: Permissions.create(allPermissions),
        createdBy: ownerMember.id,
      }),
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
