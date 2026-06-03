import { z } from "zod";

import type { PGGroupsCommandsRepository } from "@fludge/api/modules/iam/groups/infrastructure/repositories/pg-groups-commands.repository";
import { ORPCError } from "@orpc/client";
import { slugify } from "@fludge/utils/slugify";
import { createGroupCommand } from "./create-group.command";

export const updateGroupCommand = createGroupCommand.extend({
  groupId: z.uuid({
    error: "El id del grupo es requerido",
  }),
});

type CMD = z.infer<typeof updateGroupCommand> & {
  organizationId: string;
  memberId: string;
};

export class UpdateGroupCommand {
  constructor(
    private readonly groupsCommandsRepository: PGGroupsCommandsRepository,
  ) {}

  public async execute(cmd: CMD) {
    const [exists, errorExists] = await this.groupsCommandsRepository.findOne(
      cmd.organizationId,
      cmd.groupId,
    );

    if (errorExists) throw new ORPCError("INTERNAL_SERVER_ERROR", errorExists);

    if (!exists)
      throw new ORPCError("NOT_FOUND", {
        message: "Grupo no encontrado",
      });

    if (exists.name !== cmd.name) {
      const [slugAvailable, errorSlugAvailable] =
        await this.groupsCommandsRepository.slugAvailable(
          slugify(cmd.name),
          cmd.organizationId,
        );

      if (errorSlugAvailable)
        throw new ORPCError("INTERNAL_SERVER_ERROR", errorSlugAvailable);

      if (!slugAvailable)
        throw new ORPCError("CONFLICT", {
          message: "El nombre del grupo ya esta en uso",
        });
    }

    return this.groupsCommandsRepository.transaction(async (tx) => {
      const [data, error] = await this.groupsCommandsRepository.save(
        {
          id: cmd.groupId,
          name: cmd.name,
          slug: slugify(cmd.name),
          organizationId: cmd.organizationId,
          permissions: cmd.permissions,
          description: cmd.description,
        },
        {
          tx,
        },
      );

      if (error || !data)
        throw new ORPCError(
          "INTERNAL_SERVER_ERROR",
          error ?? {
            message: "Error creando grupo",
          },
        );

      const [history, errorHistory] =
        await this.groupsCommandsRepository.saveHistory(
          {
            groupId: cmd.groupId,
            action: "update",
            description: `{user.name} actualizo el grupo con id ${cmd.groupId}`,
            before: exists,
            after: data,
            by: cmd.memberId,
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

      return data;
    });
  }
}
