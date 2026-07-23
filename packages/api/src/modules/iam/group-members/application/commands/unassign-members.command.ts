import { z } from "zod";
import { ORPCError } from "@orpc/client";

import { assignMembersCommand } from "./assign-members.command";
import type { PgGroupMemberRepository } from "@fludge/api/modules/iam/group-members/infrastructure/repositories/pg-group-member.repository";

export const unassignMembersCommand = assignMembersCommand;

type CMD = z.infer<typeof unassignMembersCommand> & {
  organizationId: string;
};

export class UnAssignMembersCommand {
  constructor(
    private readonly groupMemberRepository: PgGroupMemberRepository,
  ) {}

  public async execute(cmd: CMD) {
    const [, errorAssign] =
      await this.groupMemberRepository.unassignMembers(cmd);

    if (errorAssign) throw new ORPCError("INTERNAL_SERVER_ERROR", errorAssign);
  }
}
