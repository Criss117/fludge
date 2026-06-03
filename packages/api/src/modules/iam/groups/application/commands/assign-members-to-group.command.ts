import { z } from "zod";
import { ORPCError } from "@orpc/client";

import type { OrganizationHasMembersQuery } from "@fludge/api/modules/iam/organizations/application/queries/organization-has-members.query";
import type { PGGroupsCommandsRepository } from "@fludge/api/modules/iam/groups/infrastructure/repositories/pg-groups-commands.repository";

export const assignMembersToGroupCommand = z.object({
  groupId: z.string({
    error: "Id de grupo no válido.",
  }),
  employeeIds: z
    .array(
      z.string({
        error: "Id de miembro no válido.",
      }),
    )
    .min(1, {
      error: "Debe especificar al menos un id de miembro.",
    }),
});

type CMD = z.infer<typeof assignMembersToGroupCommand> & {
  organizationId: string;
  changedByMemberId: string;
};

export class AssignMembersToGroupCommand {
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

    const [, errorAssign] = await this.groupsCommandsRepository.assignMembers(
      cmd.groupId,
      cmd.employeeIds,
      cmd.changedByMemberId,
    );

    if (errorAssign) throw new ORPCError("INTERNAL_SERVER_ERROR", errorAssign);
  }
}
