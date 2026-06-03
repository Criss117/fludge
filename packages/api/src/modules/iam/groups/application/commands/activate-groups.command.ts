import { z } from "zod";
import type { PGGroupsCommandsRepository } from "@fludge/api/modules/iam/groups/infrastructure/repositories/pg-groups-commands.repository";
import { ORPCError } from "@orpc/client";

export const activateGroupsCommand = z.object({
  groupIds: z
    .array(
      z.uuid({
        error: "Id de grupo no válido.",
      }),
    )
    .min(1, {
      error: "Debe especificar al menos un id de grupo.",
    }),
});

type CMD = z.infer<typeof activateGroupsCommand> & {
  organizationId: string;
  memberId: string;
};

export class ActivateGroupsCommand {
  constructor(
    private readonly groupsCommandsRepository: PGGroupsCommandsRepository,
  ) {}

  public async execute(cmd: CMD) {
    const [exists, errorExists] = await this.groupsCommandsRepository.exisits(
      cmd.organizationId,
      cmd.groupIds,
    );

    if (errorExists) throw new ORPCError("INTERNAL_SERVER_ERROR", errorExists);

    if (!exists)
      throw new ORPCError("NOT_FOUND", {
        message: "No se encontraron grupos",
      });

    const [, errorDelete] = await this.groupsCommandsRepository.activate(
      cmd.organizationId,
      cmd.groupIds,
    );

    if (errorDelete) throw new ORPCError("INTERNAL_SERVER_ERROR", errorDelete);

    return null;
  }
}
