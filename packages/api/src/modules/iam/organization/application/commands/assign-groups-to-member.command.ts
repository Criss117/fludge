import type { z } from "zod";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { UUID } from "@fludge/utils/uuid";
import type { GroupMemberRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/group-member.repository";
import { GroupMember } from "@fludge/api/modules/iam/organization/domain/entities/group-member.entity";
import { assignGroupsToMemberValidator } from "@fludge/utils/validators/member.validators";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";

export const assignGroupsToMemberCommand = assignGroupsToMemberValidator;

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
      throw new InternalServerError(
        errSaving,
        "iam.members.errors.isr_on_assign_group",
      );

    return activeOrganization.values;
  }
}
