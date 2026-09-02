import type { z } from "zod";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import type { GroupMemberRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/group-member.repository";
import { UUID } from "@fludge/utils/uuid";
import { ORPCError } from "@orpc/server";
import { GroupMember } from "@fludge/api/modules/iam/organization/domain/entities/group-member.entity";
import { assignGroupsToMemberValidator } from "@fludge/utils/validators/member.validators";

export const removeGroupsFromMemberCommand = assignGroupsToMemberValidator;

type CMD = z.infer<typeof removeGroupsFromMemberCommand>;

export class RemoveGroupsFromMemberCommand {
  constructor(private readonly groupMemberRepository: GroupMemberRepository) {}

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
