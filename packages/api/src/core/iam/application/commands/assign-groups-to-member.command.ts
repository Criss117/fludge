import type { z } from "zod";
import type { UserAuthContext } from "@fludge/api/core/iam/domain/entities/user-auth-context.entity";
import { GroupMember } from "@fludge/api/core/iam/domain/entities/group-member.entity";
import { GroupNotFoundException } from "@fludge/api/core/iam/domain/exceptions/group-not-found.exception";
import { MemberIsOwnerException } from "@fludge/api/core/iam/domain/exceptions/member-is-owner.exception";
import { MemberNotFoundException } from "@fludge/api/core/iam/domain/exceptions/member-not-found.exception";
import type { GroupRepository } from "@fludge/api/core/iam/domain/repositories/group.repository";
import type { MemberRepository } from "@fludge/api/core/iam/domain/repositories/member.repository";
import { InternalServerError } from "@fludge/api/core/shared/exceptions/base-exception";
import { assignGroupsToMemberValidator } from "@fludge/utils/validators/member.validators";

export const assignGroupsToMemberCommand = assignGroupsToMemberValidator;

type CMD = z.infer<typeof assignGroupsToMemberCommand>;

export class AssignGroupsToMemberCommand {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  public async execute(authContext: UserAuthContext, cmd: CMD) {
    const organizationId = authContext.organizationId.toString();

    const [groups, errGroups] = await this.groupRepository.findByIds(
      organizationId,
      cmd.groupIds,
    );

    if (errGroups)
      throw new InternalServerError(
        errGroups,
        "api_errors.iam.organizations.isr_on_find",
      );

    if (groups.length !== cmd.groupIds.length)
      throw new GroupNotFoundException();

    const [member, errMember] = await this.memberRepository.findById(
      organizationId,
      cmd.memberId,
    );

    if (errMember)
      throw new InternalServerError(
        errMember,
        "api_errors.iam.organizations.isr_on_find",
      );

    if (!member) throw new MemberNotFoundException();

    if (member.role.isOwner()) throw new MemberIsOwnerException();

    const groupsToSave = groups.map((group) => {
      const groupMember = GroupMember.create({
        groupId: group.id.toString(),
        memberId: cmd.memberId,
        createdBy: authContext.member.id.toString(),
        organizationId,
      });

      group.addGroupMember(groupMember);

      return group;
    });

    const [, errSaving] = await this.groupRepository.save(groupsToSave);

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "api_errors.iam.members.isr_on_assign_group",
      );

    return groupsToSave.map((gm) => gm.values);
  }
}
