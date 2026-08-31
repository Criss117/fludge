import { z } from "zod";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { UUID } from "@fludge/utils/uuid";
import { ORPCError } from "@orpc/server";
import type { GroupMemberRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/group-member.repository";
import { GroupMember } from "../../domain/entities/group-member.entity";

export const assignGroupsToMemberCommand = z.object({
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

type CMD = z.infer<typeof assignGroupsToMemberCommand>;

export class AssignGroupsToMemberCommand {
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

    cmd.groupIds.forEach((gId) => {
      const newGroupMember = GroupMember.create({
        createdBy: loggedMember.id.toString(),
        groupId: gId,
        memberId: cmd.memberId,
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
