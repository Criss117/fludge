import { z } from "zod";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { UUID } from "@fludge/utils/uuid";
import { ORPCError } from "@orpc/server";
import type { PgGroupMemberRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-group-member.repository";
import { GroupMember } from "@fludge/api/modules/iam/organization/domain/entities/group-member.entity";

export const removeGroupsFromMemberCommand = z.object({
  memberId: z.uuid({
    error: "El id del grupo es requerido",
  }),
  groupIds: z
    .array(
      z.uuid({
        error: "El id del miembro es requerido",
      }),
    )
    .min(1, {
      error: "Debe especificar al menos un miembro",
    }),
});

type CMD = z.infer<typeof removeGroupsFromMemberCommand>;

export class RemoveGroupsFromMemberCommand {
  constructor(
    private readonly groupMemberRepository: PgGroupMemberRepository,
  ) {}

  public async execute(activeOrganization: Organization, cmd: CMD) {
    let groupMembersToDelete: GroupMember[] = [];

    cmd.groupIds.forEach((gId) => {
      const gmToRemove = activeOrganization.removeGroupMember(
        UUID.fromString(gId),
        UUID.fromString(cmd.memberId),
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
