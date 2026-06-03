import { z } from "zod";
import { slugify } from "@fludge/utils/slugify";
import { EventBus } from "@fludge/api/modules/shared/domain/event-bus";
import { ORPCError } from "@orpc/client";
import { OrganizationRegisteredEvent } from "@fludge/api/modules/shared/domain/events";
import { auth } from "@fludge/auth";
import { tryCatch } from "@fludge/utils/trycatch";

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
  constructor(private readonly eventBus: EventBus) {}

  public async execute(cmd: CMD, headers: Headers) {
    const [data, error] = await tryCatch(
      auth.api.createOrganization({
        body: {
          legalName: cmd.legalName,
          name: cmd.name,
          phone: cmd.phone,
          taxId: cmd.taxId,
          address: cmd.address,
          slug: slugify(cmd.name),
          keepCurrentActiveOrganization: true,
        },
        headers,
      }),
    );

    if (error || !data)
      throw new ORPCError(
        "CONFLICT",
        error ?? {
          message: "Error creando organización",
        },
      );

    await this.eventBus.dispatch(new OrganizationRegisteredEvent(data.id));

    return data;
  }
}
