import type { z } from "zod";
import type { UserAuthContext } from "@fludge/api/core/iam/domain/entities/user-auth-context.entity";
import { GroupNotFoundException } from "@fludge/api/core/iam/domain/exceptions/group-not-found.exception";
import { MemberIsOwnerException } from "@fludge/api/core/iam/domain/exceptions/member-is-owner.exception";
import { MemberNotFoundException } from "@fludge/api/core/iam/domain/exceptions/member-not-found.exception";
import type { GroupMemberRepository } from "@fludge/api/core/iam/domain/repositories/group-member.repository";
import type { GroupRepository } from "@fludge/api/core/iam/domain/repositories/group.repository";
import type { MemberRepository } from "@fludge/api/core/iam/domain/repositories/member.repository";
import { InternalServerError } from "@fludge/api/core/shared/exceptions/base-exception";
import { assignMembersToGroupValidator } from "@fludge/utils/validators/group.validators";

export const removeMembersFromGroupCommand = assignMembersToGroupValidator;

type CMD = z.infer<typeof removeMembersFromGroupCommand>;

export class RemoveMembersFromGroupCommand {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly memberRepository: MemberRepository,
    private readonly groupMemberRepository: GroupMemberRepository,
  ) {}

  public async execute(authContext: UserAuthContext, cmd: CMD) {
    const organizationId = authContext.organizationId.toString();

    const [group, errGroup] = await this.groupRepository.findById(cmd.groupId);

    if (errGroup)
      throw new InternalServerError(
        errGroup,
        "api_errors.iam.organizations.isr_on_find",
      );

    if (!group || group.values.organizationId !== organizationId)
      throw new GroupNotFoundException();

    const [members, errMembers] = await this.memberRepository.findByIds(
      cmd.memberIds,
      organizationId,
    );

    if (errMembers)
      throw new InternalServerError(
        errMembers,
        "api_errors.iam.organizations.isr_on_find",
      );

    const missingMember = cmd.memberIds.some(
      (memberId) =>
        !members.some((member) => member.id.toString() === memberId),
    );

    if (missingMember) throw new MemberNotFoundException();

    if (members.some((member) => member.role.isOwner()))
      throw new MemberIsOwnerException();

    const [, errSaving] =
      await this.groupMemberRepository.deleteByGroupAndMemberIds(
        organizationId,
        cmd.groupId,
        cmd.memberIds,
      );

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "api_errors.iam.groups.isr_on_unassign_member",
      );
  }
}
