import type { z } from "zod";
import type { GroupRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/group.repository";
import type { GroupMemberRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/group-member.repository";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { UUID } from "@fludge/utils/uuid";
import { ORPCError } from "@orpc/server";
import { deleteGroupsValidator } from "@fludge/utils/validators/group.validators";

export const deleteGroupsCommand = deleteGroupsValidator;

type CMD = z.infer<typeof deleteGroupsCommand>;

export class DeleteGroupsCommand {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly groupMemberRepository: GroupMemberRepository,
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
