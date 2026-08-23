import { Permissions } from "@fludge/utils/permissions";
import { z } from "zod";
import type { PgOrganizationRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-organization.repository";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization";
import { UUID } from "@fludge/utils/uuid";
import { ORPCError } from "@orpc/server";
import { createGroupCommand } from "./create-group.command";

export const updateGroupCommand = createGroupCommand.partial().extend({
  id: z.uuid({
    error: "El id del grupo es requerido",
  }),
  toogleActive: z
    .boolean({
      error: "La opción de activar o desactivar el grupo no es válida",
    })
    .default(false)
    .optional(),
});

type CMD = z.infer<typeof updateGroupCommand>;

export class UpdateGroupCommand {
  constructor(
    private readonly organizationRepository: PgOrganizationRepository,
  ) {}

  public async execute(activeOrganization: Organization, cmd: CMD) {
    activeOrganization.updateGroup(UUID.fromString(cmd.id), {
      description: cmd.description,
      permissions: cmd.permissions
        ? Permissions.create(cmd.permissions)
        : undefined,
      name: cmd.name,
      toogleActive: cmd.toogleActive,
    });

    const [, errSaving] = await this.organizationRepository.save(
      activeOrganization,
      {
        onlySave: ["groups"],
      },
    );

    if (errSaving)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al guardar la organización",
        cause: errSaving.cause,
      });

    return activeOrganization.values;
  }
}
