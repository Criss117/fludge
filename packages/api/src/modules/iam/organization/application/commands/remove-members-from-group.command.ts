import { z } from "zod";
import { ORPCError } from "@orpc/server";

import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { UUID } from "@fludge/utils/uuid";
import type { PgGroupMemberRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-group-member.repository";
import { GroupMember } from "@fludge/api/modules/iam/organization/domain/entities/group-member.entity";

export const removeMembersFromGroupCommand = z.object({
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

type CMD = z.infer<typeof removeMembersFromGroupCommand>;

export class RemoveMembersFromGroupCommand {
  constructor(
    private readonly groupMemberRepository: PgGroupMemberRepository,
  ) {}

  public async execute(activeOrganization: Organization, cmd: CMD) {
    let groupMembersToDelete: GroupMember[] = [];

    cmd.memberIds.forEach((memberId) => {
      const gmToRemove = activeOrganization.removeGroupMember(
        UUID.fromString(cmd.groupId),
        UUID.fromString(memberId),
      );

      groupMembersToDelete.push(gmToRemove);
    });

    const [, errSaving] = await this.groupMemberRepository.delete(
      activeOrganization.id.toString(),
      groupMembersToDelete,
    );

    if (errSaving)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al guardar los cambios",
        cause: errSaving.cause,
      });

    return activeOrganization.values;
  }
}
