import { z } from "zod";
import { ORPCError } from "@orpc/client";

import type { PgGroupMemberRepository } from "@fludge/api/modules/iam/group-members/infrastructure/repositories/pg-group-member.repository";
import type { OrganizationHasService } from "@fludge/api/modules/iam/organizations/application/services/organization-has.service";

export const assignMembersCommand = z.object({
  groupIds: z
    .array(
      z.uuid({
        error: "Id de grupo no válido.",
      }),
    )
    .min(1, {
      error: "Debe especificar al menos un id de grupo.",
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
  };
};

export class AssignMembersCommand {
  constructor(
    private readonly groupMemberRepository: PgGroupMemberRepository,
    private readonly organizationHasService: OrganizationHasService,
  ) {}

  public async execute(cmd: CMD) {
    const organizationHasGroups = await this.organizationHasService.hasGroups({
      organizationId: cmd.organizationId,
      groupIds: cmd.groupIds,
    });

    if (!organizationHasGroups.exists)
      throw new ORPCError("NOT_FOUND", {
        message: "No se encontraron grupos",
      });

    const { exists } = await this.organizationHasService.hasMembers({
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

    const [data, errorAssign] = await this.groupMemberRepository.assignMembers(
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

    return data;
  }
}
