import type { z } from "zod";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import type { GroupMemberRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/group-member.repository";
import { ORPCError } from "@orpc/server";

import { UUID } from "@fludge/utils/uuid";
import { GroupMember } from "@fludge/api/modules/iam/organization/domain/entities/group-member.entity";
import { assignMembersToGroupValidator } from "@fludge/utils/validators/group.validators";

export const removeMembersFromGroupCommand = assignMembersToGroupValidator;

type CMD = z.infer<typeof removeMembersFromGroupCommand>;

export class RemoveMembersFromGroupCommand {
  constructor(private readonly groupMemberRepository: GroupMemberRepository) {}

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
