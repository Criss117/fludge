import { z } from "zod";
import { ORPCError } from "@orpc/server";

import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { UUID } from "@fludge/utils/uuid";
import type { GroupMemberRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/group-member.repository";
import { GroupMember } from "../../domain/entities/group-member.entity";

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
  constructor(private readonly groupMemberRepository: GroupMemberRepository) {}

  public async execute(
    loggedUserId: string,
    activeOrganization: Organization,
    cmd: CMD,
  ) {
    const loggedMember = activeOrganization.members.getMemberByUserId(
      UUID.fromString(loggedUserId),
    )!;

    let groupMembersToSave: GroupMember[] = [];

    cmd.memberIds.forEach((memberId) => {
      const newGroupMember = GroupMember.create({
        createdBy: loggedMember.id.toString(),
        groupId: cmd.groupId,
        memberId: memberId,
      });

      activeOrganization.addGroupMember(newGroupMember);

      groupMembersToSave.push(newGroupMember);
    });

    const [, errSaving] = await this.groupMemberRepository.save(
      activeOrganization.id.toString(),
      groupMembersToSave,
    );

    if (errSaving)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al guardar los cambios",
        cause: errSaving.cause,
      });

    return activeOrganization.values;
  }
}
