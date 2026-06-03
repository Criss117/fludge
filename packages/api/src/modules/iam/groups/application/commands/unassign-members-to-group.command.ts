import { z } from "zod";
import { ORPCError } from "@orpc/client";

import { assignMembersToGroupCommand } from "./assign-members-to-group.command";
import type { OrganizationHasMembersQuery } from "@fludge/api/modules/iam/organizations/application/queries/organization-has-members.query";
import type { PGGroupsCommandsRepository } from "@fludge/api/modules/iam/groups/infrastructure/repositories/pg-groups-commands.repository";

export const unassignMembersToGroupCommand = assignMembersToGroupCommand;

type CMD = z.infer<typeof unassignMembersToGroupCommand> & {
  organizationId: string;
  changedByMemberId: string;
};

export class UnAssignMembersToGroupCommand {
  constructor(
    private readonly organizationHasMembersQuery: OrganizationHasMembersQuery,
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

    const { exists } = await this.organizationHasMembersQuery.execute({
      organizationId: cmd.organizationId,
      memberIds: cmd.employeeIds,
      options: {
        filterBy: "member",
      },
    });

    if (!exists)
      throw new ORPCError("NOT_FOUND", {
        message: "No se encontraron miembros",
      });

    const [, errorAssign] = await this.groupsCommandsRepository.unassignMembers(
      cmd.groupId,
      cmd.employeeIds,
    );

    if (errorAssign) throw new ORPCError("INTERNAL_SERVER_ERROR", errorAssign);
  }
}
