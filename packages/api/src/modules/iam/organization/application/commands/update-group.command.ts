import { Permissions } from "@fludge/utils/permissions/index";
import { z } from "zod";

import { UUID } from "@fludge/utils/uuid";
import { ORPCError } from "@orpc/server";
import { createGroupCommand } from "./create-group.command";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { statusEnum } from "@fludge/db/schema/enums";
import type { PgGroupRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-group.repository";

export const updateGroupCommand = createGroupCommand.partial().extend({
  id: z.uuid({
    error: "El id del grupo es requerido",
  }),
  status: z.enum(statusEnum).optional(),
});

type CMD = z.infer<typeof updateGroupCommand>;

export class UpdateGroupCommand {
  constructor(private readonly groupRepository: PgGroupRepository) {}

  public async execute(activeOrganization: Organization, cmd: CMD) {
    const updatedGroup = activeOrganization.groups.updateGroup(
      UUID.fromString(cmd.id),
      {
        description: cmd.description,
        permissions: cmd.permissions
          ? Permissions.create(cmd.permissions)
          : undefined,
        name: cmd.name,
        status: cmd.status,
      },
    );

    const [, errSaving] = await this.groupRepository.save(
      activeOrganization.id.toString(),
      updatedGroup,
    );

    if (errSaving)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al guardar la organización",
        cause: errSaving.cause,
      });

    return activeOrganization.values;
  }
}
