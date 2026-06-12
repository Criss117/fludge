import { z } from "zod";
import { ORPCError } from "@orpc/client";

import type { OrganizationHasMembersQuery } from "@fludge/api/modules/iam/organizations/application/queries/organization-has-members.query";
import type { PgGroupMembersCommandsRepository } from "@fludge/api/modules/iam/group-members/infrastructure/repositories/pg-group-members-commands.repository";
import type { OrganizationHasGroupsQuery } from "@fludge/api/modules/iam/organizations/application/queries/organization-has-groups.query";

export const assignMembersCommand = z.object({
  groupIds: z
    .array(
      z.uuid({
        error: "Id de miembro no válido.",
      }),
    )
    .min(1, {
      error: "Debe especificar al menos un id de miembro.",
    }),
  memberIds: z
    .array(
      z.string({
        error: "Id de miembro no válido.",
      }),
    )
    .min(1, {
      error: "Debe especificar al menos un id de miembro.",
    }),
});

type CMD = z.infer<typeof assignMembersCommand> & {
  organizationId: string;
  assignedBy: {
    memberId: string;
    name: string;
    email: string;
  };
};

export class AssignMembersCommand {
  constructor(
    private readonly organizationHasMembersQuery: OrganizationHasMembersQuery,
    private readonly organizationHasGroupsQuery: OrganizationHasGroupsQuery,
    private readonly groupMembersCommandsRepository: PgGroupMembersCommandsRepository,
  ) {}

  public async execute(cmd: CMD) {
    const organizationHasGroups = await this.organizationHasGroupsQuery.execute(
      {
        organizationId: cmd.organizationId,
        groupIds: cmd.groupIds,
      },
    );

    if (!organizationHasGroups.exists)
      throw new ORPCError("NOT_FOUND", {
        message: "No se encontraron grupos",
      });

    const { exists } = await this.organizationHasMembersQuery.execute({
      organizationId: cmd.organizationId,
      memberIds: cmd.memberIds,
      options: {
        filterBy: "member",
      },
    });

    if (!exists)
      throw new ORPCError("NOT_FOUND", {
        message: "No se encontraron miembros",
      });

    const [data, errorAssign] =
      await this.groupMembersCommandsRepository.assignMembers(
        cmd.groupIds
          .map((groupId) =>
            cmd.memberIds.map((memberId) => ({
              groupId,
              memberId,
              assignedBy: cmd.assignedBy.memberId,
            })),
          )
          .flat(),
      );

    if (errorAssign) throw new ORPCError("INTERNAL_SERVER_ERROR", errorAssign);

    return data.map((d) => ({
      ...d,
      assignedBy: cmd.assignedBy,
    }));
  }
}
