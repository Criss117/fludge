import { z } from "zod";

import { registerOrganizationCommand } from "@fludge/api/modules/iam/organizations/application/commands/register-organization.command";
import type { PGOrganizationRepository } from "@fludge/api/modules/iam/organizations/infrastructure/repositories/pg-organization.repository";
import { tryCatch } from "@fludge/utils/trycatch";
import { auth } from "@fludge/auth";
import { slugify } from "@fludge/utils/slugify";
import { ORPCError } from "@orpc/server";
import type { OrganizationHistoryInsert } from "@fludge/db/schemas/iam.schema";

export const updateOrganizationCommand = registerOrganizationCommand;

type CMD = z.infer<typeof updateOrganizationCommand> & {
  organizationId: string;
  changesBy: {
    memberId: string;
    name: string;
    email: string;
  };
};

export class UpdateOrganizationCommand {
  constructor(
    private readonly organizationRepository: PGOrganizationRepository,
  ) {}

  public async execute(cmd: CMD, headers: Headers) {
    const [organization, errorFind] = await this.organizationRepository.findOne(
      cmd.organizationId,
    );

    if (errorFind) throw new ORPCError("INTERNAL_SERVER_ERROR", errorFind);

    if (!organization)
      throw new ORPCError("NOT_FOUND", {
        message: "No se encontró la organización",
      });

    const [data, error] = await tryCatch(
      auth.api.updateOrganization({
        headers,
        body: {
          data: {
            address: cmd.address,
            name: cmd.name,
            legalName: cmd.legalName,
            phone: cmd.phone,
            slug: slugify(cmd.name),
            taxId: cmd.taxId,
          },
          organizationId: cmd.organizationId,
        },
      }),
    );

    if (error || !data)
      throw new ORPCError(
        "CONFLICT",
        error ?? {
          message: "Ha ocurrido un error al actualizar la organización",
        },
      );

    const [, errorSaveHistory] = await this.organizationRepository.saveHistory({
      organizationId: cmd.organizationId,
      action: "update",
      description: `{user.name} actualizó la organización con id ${cmd.organizationId}`,
      before: organization,
      after: data as OrganizationHistoryInsert["after"],
      actorId: cmd.changesBy.memberId,
    });

    console.error(errorSaveHistory);

    return data;
  }
}
