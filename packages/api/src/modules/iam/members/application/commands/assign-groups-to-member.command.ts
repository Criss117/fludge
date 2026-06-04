import { z } from "zod";
import type { PGMembersCommandsRepository } from "@fludge/api/modules/iam/members/infrastructure/repositories/pg-members-commands.repository";
import { ORPCError } from "@orpc/client";
import type { OrganizationHasGroupsQuery } from "../../../organizations/application/queries/organization-has-groups.query";

export const assignGroupsToMemberCommand = z.object({
  memberId: z.string({
    error: "Id de miembro no válido.",
  }),
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

type CMD = z.infer<typeof assignGroupsToMemberCommand> & {
  organizationId: string;
  changedByMemberId: string;
};

export class AssignGroupsToMemberCommand {
  constructor(
    private readonly membersCommandsRepository: PGMembersCommandsRepository,
    private readonly organizationHasGroupsQuery: OrganizationHasGroupsQuery,
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

    const { exists } = await this.organizationHasGroupsQuery.execute({
      organizationId: cmd.organizationId,
      groupIds: cmd.groupIds,
    });

    if (!exists)
      throw new ORPCError("NOT_FOUND", {
        message: "No se encontraron miembros",
      });

    const [, errorAssign] = await this.membersCommandsRepository.assigGroups(
      cmd.memberId,
      cmd.groupIds,
      cmd.changedByMemberId,
    );

    if (errorAssign) throw new ORPCError("INTERNAL_SERVER_ERROR", errorAssign);
  }
}
