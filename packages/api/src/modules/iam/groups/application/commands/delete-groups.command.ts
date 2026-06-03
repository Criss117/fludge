import { z } from "zod";
import type { PGGroupsCommandsRepository } from "@fludge/api/modules/iam/groups/infrastructure/repositories/pg-groups-commands.repository";
import { ORPCError } from "@orpc/client";

export const deleteGroupsCommand = z.object({
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

type CDM = z.infer<typeof deleteGroupsCommand> & {
  organizationId: string;
};

export class DeleteGroupsCommand {
  constructor(
    private readonly groupsCommandsRepository: PGGroupsCommandsRepository,
  ) {}

  public async execute(cmd: CDM) {
    const [, errorDelete] = await this.groupsCommandsRepository.hardDelete(
      cmd.organizationId,
      cmd.groupIds,
    );

    if (errorDelete) throw new ORPCError("INTERNAL_SERVER_ERROR", errorDelete);

    return null;
  }
}
