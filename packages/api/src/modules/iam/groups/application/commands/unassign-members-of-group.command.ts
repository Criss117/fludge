import { z } from "zod";
import { ORPCError } from "@orpc/client";

import { assignMembersToGroupCommand } from "./assign-members-to-group.command";
import type { PGGroupsCommandsRepository } from "@fludge/api/modules/iam/groups/infrastructure/repositories/pg-groups-commands.repository";

export const unassignMembersOfGroupCommand = assignMembersToGroupCommand;

type CMD = z.infer<typeof unassignMembersOfGroupCommand> & {
  organizationId: string;
  changedByMemberId: string;
};

export class UnAssignMembersOfGroupCommand {
  constructor(
    private readonly groupsCommandsRepository: PGGroupsCommandsRepository,
  ) {}

  public async execute(cmd: CMD) {
    const [group, error] = await this.groupsCommandsRepository.findOne(
      cmd.organizationId,
      cmd.groupId,
    );

    if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    if (!group)
      throw new ORPCError("NOT_FOUND", {
        message: "No se encontró el grupo",
      });

    const [, errorAssign] = await this.groupsCommandsRepository.unassignMembers(
      cmd.groupId,
      cmd.memberIds,
    );

    if (errorAssign) throw new ORPCError("INTERNAL_SERVER_ERROR", errorAssign);
  }
}
