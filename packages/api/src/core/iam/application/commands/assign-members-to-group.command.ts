import type { z } from "zod";
import type { UserAuthContext } from "@fludge/api/core/iam/domain/entities/user-auth-context.entity";
import { GroupMember } from "@fludge/api/core/iam/domain/entities/group-member.entity";
import { GroupNotFoundException } from "@fludge/api/core/iam/domain/exceptions/group-not-found.exception";
import { MemberIsOwnerException } from "@fludge/api/core/iam/domain/exceptions/member-is-owner.exception";
import { MemberNotFoundException } from "@fludge/api/core/iam/domain/exceptions/member-not-found.exception";
import type { GroupRepository } from "@fludge/api/core/iam/domain/repositories/group.repository";
import type { MemberRepository } from "@fludge/api/core/iam/domain/repositories/member.repository";
import { InternalServerError } from "@fludge/api/core/shared/exceptions/base-exception";
import { assignMembersToGroupValidator } from "@fludge/utils/validators/group.validators";

export const assignMembersToGroupCommand = assignMembersToGroupValidator;

type CMD = z.infer<typeof assignMembersToGroupCommand>;

export class AssignMembersToGroupCommand {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  public async execute(authContext: UserAuthContext, cmd: CMD) {
    const organizationId = authContext.organizationId.toString();

    const [group, errGroup] = await this.groupRepository.findById(
      authContext.organizationId.toString(),
      cmd.groupId,
    );

    if (errGroup)
      throw new InternalServerError(
        errGroup,
        "api_errors.iam.organizations.isr_on_find",
      );

    if (!group) throw new GroupNotFoundException();

    const [members, errMembers] = await this.memberRepository.findByIds(
      organizationId,
      cmd.memberIds,
    );

    if (errMembers)
      throw new InternalServerError(
        errMembers,
        "api_errors.iam.organizations.isr_on_find",
      );

    if (cmd.memberIds.length !== members.length)
      throw new MemberNotFoundException();

    if (members.some((member) => member.role.isOwner()))
      throw new MemberIsOwnerException();

    members.forEach((member) => {
      const gm = GroupMember.create({
        groupId: cmd.groupId,
        memberId: member.id.toString(),
        createdBy: authContext.member.id.toString(),
        organizationId,
      });

      group.addGroupMember(gm);
    });

    const [, errSaving] = await this.groupRepository.save(group);

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "api_errors.iam.groups.isr_on_assign_member",
      );

    return group.values;
  }
}
