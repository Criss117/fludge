import { z } from "zod";
import { ORPCError } from "@orpc/server";

import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { UUID } from "@fludge/utils/uuid";
import type { PgGroupMemberRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-group-member.repository";

export const assignMembersToGroupCommand = z.object({
  groupId: z.uuid({
    error: "El id del grupo es requerido",
  }),
  memberIds: z
    .array(
      z.uuid({
        error: "El id del miembro es requerido",
      }),
    )
    .min(1, {
      error: "Debe especificar al menos un miembro",
    }),
});

type CMD = z.infer<typeof assignMembersToGroupCommand>;

export class AssignMembersToGroupCommand {
  constructor(
    private readonly groupMemberRepository: PgGroupMemberRepository,
  ) {}

  public async execute(
    loggedUserId: string,
    activeOrganization: Organization,
    cmd: CMD,
  ) {
    const loggedMember = activeOrganization.members.getMemberByUserId(
      UUID.fromString(loggedUserId),
    )!;

    cmd.memberIds.forEach((memberId) => {
      activeOrganization.addGroupMember(
        UUID.fromString(cmd.groupId),
        UUID.fromString(memberId),
        loggedMember.id,
      );
    });

    const [, errSaving] = await this.groupMemberRepository.save(
      activeOrganization.id.toString(),
      activeOrganization.groupMembers,
    );

    if (errSaving)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al guardar los cambios",
        cause: errSaving.cause,
      });

    return activeOrganization.values;
  }
}
