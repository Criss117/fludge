import { z } from "zod";
import { ORPCError } from "@orpc/client";

import { slugify } from "@fludge/utils/slugify";
import { preparePermissions } from "@fludge/utils/permissions/index";
import type { PGGroupRepository } from "@fludge/api/modules/iam/groups/infrastructure/repositories/pg-group.repository";
import { createGroupCommand } from "@fludge/api/modules/iam/groups/application/commands/create-group.command";
import type { GroupsChecksService } from "@fludge/api/modules/iam/groups/application/services/groups-checks.service";
import type { PGGroupHistoryRepository } from "@fludge/api/modules/iam/groups/infrastructure/repositories/pg-group-history.respository";

export const updateGroupCommand = createGroupCommand.extend({
  groupId: z.uuid({
    error: "El id del grupo es requerido",
  }),
  // null  => activate  (clears deleted_at)
  // Date  => deactivate (sets deleted_at)
  // omitted => leave status untouched (regular edit)
  deletedAt: z.date().nullable().optional(),
});

type CMD = z.infer<typeof updateGroupCommand> & {
  organizationId: string;
  updatedBy: {
    memberId: string;
  };
};

export class UpdateGroupCommand {
  constructor(
    private readonly groupRepository: PGGroupRepository,
    private readonly groupHistoryRepository: PGGroupHistoryRepository,
    private readonly groupsChecksService: GroupsChecksService,
  ) {}

  public async execute(cmd: CMD) {
    const [existingGroup, errorExists] = await this.groupRepository.findOne(
      cmd.organizationId,
      cmd.groupId,
    );

    if (errorExists) throw new ORPCError("INTERNAL_SERVER_ERROR", errorExists);

    if (!existingGroup)
      throw new ORPCError("NOT_FOUND", {
        message: "Grupo no encontrado",
      });

    if (existingGroup.name !== cmd.name) {
      const [fieldCheck, errorFieldCheck] =
        await this.groupsChecksService.checkUniqueFields(
          {
            slug: slugify(cmd.name),
            name: cmd.name,
          },
          cmd.organizationId,
          cmd.groupId,
        );

      if (errorFieldCheck)
        throw new ORPCError("INTERNAL_SERVER_ERROR", errorFieldCheck);

      if (!fieldCheck.slugTaken)
        throw new ORPCError("CONFLICT", {
          message: "El slug del grupo ya esta en uso",
        });

      if (!fieldCheck.nameTaken)
        throw new ORPCError("CONFLICT", {
          message: "El nombre del grupo ya esta en uso",
        });
    }

    return this.groupRepository.transaction(async (tx) => {
      const [updatedGroup, error] = await this.groupRepository.save(
        {
          id: cmd.groupId,
          name: cmd.name,
          slug: slugify(cmd.name),
          organizationId: cmd.organizationId,
          permissions: preparePermissions(cmd.permissions),
          description: cmd.description,
          deletedAt: cmd.deletedAt,
        },
        {
          tx,
        },
      );

      if (error || !updatedGroup)
        throw new ORPCError(
          "INTERNAL_SERVER_ERROR",
          error ?? {
            message: "Error creando grupo",
          },
        );

      const [history, errorHistory] = await this.groupHistoryRepository.save(
        {
          groupId: cmd.groupId,
          action: "update",
          description: `{user.name} actualizo el grupo con id ${cmd.groupId}`,
          before: existingGroup,
          after: updatedGroup,
          createdBy: cmd.updatedBy.memberId,
        },
        {
          tx,
        },
      );

      if (errorHistory || !history)
        throw new ORPCError(
          "INTERNAL_SERVER_ERROR",
          errorHistory ?? {
            message: "Error creando historial de grupo",
          },
        );

      return updatedGroup;
    });
  }
}
