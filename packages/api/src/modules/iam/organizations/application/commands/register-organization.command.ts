import { z } from "zod";
import type { PGOrganizationCommandsRepository } from "@fludge/api/modules/iam/organizations/infrastructure/repositories/pg-organization-commands.repository";
import { slugify } from "@fludge/utils/slugify";
import { EventBus } from "@fludge/api/modules/shared/domain/event-bus";
import { ORPCError } from "@orpc/client";
import { OrganizationRegisteredEvent } from "@fludge/api/modules/shared/domain/events";

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
    private readonly eventBus: EventBus,
    private readonly organizationCommandsRepository: PGOrganizationCommandsRepository,
  ) {}

  public async execute(loggedUserId: string, cmd: CMD) {
    const [data, error] = await this.organizationCommandsRepository.save({
      address: cmd.address,
      legalName: cmd.legalName,
      name: cmd.name,
      phone: cmd.phone,
      taxId: cmd.taxId,
      ownerId: loggedUserId,
      slug: slugify(cmd.name),
    });

    if (error || !data)
      throw new ORPCError(
        "INTERNAL_SERVER_ERROR",
        error ?? {
          message: "Error creando organización",
        },
      );

    await this.eventBus.dispatch(new OrganizationRegisteredEvent(data.id));

    return data;
  }
}
