import { z } from "zod";
import { ORPCError } from "@orpc/client";

import { assignGroupsToMemberCommand } from "./assign-groups-to-member.command";
import type { PGMembersCommandsRepository } from "@fludge/api/modules/iam/members/infrastructure/repositories/pg-members-commands.repository";

export const unassignGroupsOfMemberCommand = assignGroupsToMemberCommand;

type CMD = z.infer<typeof unassignGroupsOfMemberCommand> & {
  organizationId: string;
  changedByMemberId: string;
};

export class UnAssignGroupsOfMemberCommand {
  constructor(
    private readonly membersCommandsRepository: PGMembersCommandsRepository,
  ) {}

  public async execute(cmd: CMD) {
    const [member, error] = await this.membersCommandsRepository.findOne(
      cmd.organizationId,
      cmd.memberId,
    );

    if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    if (!member)
      throw new ORPCError("NOT_FOUND", {
        message: "No se encontró el miembro",
      });

    const [, errorAssign] = await this.membersCommandsRepository.unassigGroups(
      cmd.memberId,
      cmd.groupIds,
    );

    if (errorAssign) throw new ORPCError("INTERNAL_SERVER_ERROR", errorAssign);
  }
}
