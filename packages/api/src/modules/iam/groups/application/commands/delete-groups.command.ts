import { z } from "zod";
import type { PGGroupRepository } from "@fludge/api/modules/iam/groups/infrastructure/repositories/pg-group.repository";
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
  constructor(private readonly groupRepository: PGGroupRepository) {}

  public async execute(cmd: CDM) {
    const [, errorDelete] = await this.groupRepository.hardDelete(
      cmd.organizationId,
      cmd.groupIds,
    );

    if (errorDelete) throw new ORPCError("INTERNAL_SERVER_ERROR", errorDelete);

    return null;
  }
}
