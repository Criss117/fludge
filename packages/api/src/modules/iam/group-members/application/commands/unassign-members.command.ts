import { z } from "zod";
import { ORPCError } from "@orpc/client";

import { assignMembersCommand } from "./assign-members.command";
import type { PgGroupMembersCommandsRepository } from "@fludge/api/modules/iam/group-members/infrastructure/repositories/pg-group-members-commands.repository";

export const unassignMembersCommand = assignMembersCommand;

type CMD = z.infer<typeof unassignMembersCommand> & {
  organizationId: string;
};

export class UnAssignMembersCommand {
  constructor(
    private readonly groupMembersCommandsRepository: PgGroupMembersCommandsRepository,
  ) {}

  public async execute(cmd: CMD) {
    const [, errorAssign] =
      await this.groupMembersCommandsRepository.unassignMembers(
        cmd.groupIds,
        cmd.memberIds,
      );

    if (errorAssign) throw new ORPCError("INTERNAL_SERVER_ERROR", errorAssign);
  }
}
