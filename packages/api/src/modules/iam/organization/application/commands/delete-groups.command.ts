import { z } from "zod";
import type { PgGroupRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-group.repository";
import type { PgGroupMemberRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-group-member.repository";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { UUID } from "@fludge/utils/uuid";
import { ORPCError } from "@orpc/server";

export const deleteGroupsCommand = z.object({
  groupIds: z.array(z.uuid({ error: "El id del grupo es requerido" })).min(1, {
    error: "Debe especificar al menos un grupo",
  }),
});

type CMD = z.infer<typeof deleteGroupsCommand>;

export class DeleteGroupsCommand {
  constructor(
    private readonly groupRepository: PgGroupRepository,
    private readonly groupMemberRepository: PgGroupMemberRepository,
  ) {}

  public async execute(activeOrganization: Organization, cmd: CMD) {
    const valuesToRemove = cmd.groupIds.map((gId) =>
      activeOrganization.deleteGroup(UUID.fromString(gId)),
    );

    const groupToDelete = valuesToRemove.map((g) => g.group);
    const groupMembersToDelete = valuesToRemove.flatMap((g) => g.groupMembers);

    const [, errTransaction] = await this.groupRepository.transaction(
      async (tx) => {
        const [, errGM] = await this.groupMemberRepository.delete(
          activeOrganization.id.toString(),
          groupMembersToDelete,
          {
            tx,
          },
        );

        if (errGM)
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Error al eliminar la relación de grupos",
            cause: errGM.cause,
          });

        const [, errDelete] = await this.groupRepository.delete(
          activeOrganization.id.toString(),
          groupToDelete,
          {
            tx,
          },
        );

        if (errDelete)
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Error al eliminar grupos",
            cause: errDelete.cause,
          });
      },
    );

    if (errTransaction)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al eliminar grupos",
        cause: errTransaction.cause,
      });

    return activeOrganization.values;
  }
}
