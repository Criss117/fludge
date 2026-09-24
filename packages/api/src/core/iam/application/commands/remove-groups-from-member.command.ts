import type { z } from "zod";
import type { UserAuthContext } from "@fludge/api/core/iam/domain/entities/user-auth-context.entity";
import { GroupNotFoundException } from "@fludge/api/core/iam/domain/exceptions/group-not-found.exception";
import { MemberIsOwnerException } from "@fludge/api/core/iam/domain/exceptions/member-is-owner.exception";
import { MemberNotFoundException } from "@fludge/api/core/iam/domain/exceptions/member-not-found.exception";
import type { GroupMemberRepository } from "@fludge/api/core/iam/domain/repositories/group-member.repository";
import type { GroupRepository } from "@fludge/api/core/iam/domain/repositories/group.repository";
import type { MemberRepository } from "@fludge/api/core/iam/domain/repositories/member.repository";
import { InternalServerError } from "../../../shared/exceptions/base-exception";
import { assignGroupsToMemberValidator } from "@fludge/utils/validators/member.validators";

export const removeGroupsFromMemberCommand = assignGroupsToMemberValidator;

type CMD = z.infer<typeof removeGroupsFromMemberCommand>;

export class RemoveGroupsFromMemberCommand {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly memberRepository: MemberRepository,
    private readonly groupMemberRepository: GroupMemberRepository,
  ) {}

  public async execute(authContext: UserAuthContext, cmd: CMD) {
    const organizationId = authContext.organizationId.toString();

    const [groups, errGroups] = await this.groupRepository.findByIds(
      cmd.groupIds,
      organizationId,
    );

    if (errGroups)
      throw new InternalServerError(
        errGroups,
        "api_errors.iam.organizations.isr_on_find",
      );

    const missingGroup = cmd.groupIds.some(
      (groupId) => !groups.some((group) => group.id.toString() === groupId),
    );

    if (missingGroup) throw new GroupNotFoundException();

    const [members, errMembers] = await this.memberRepository.findByIds(
      [cmd.memberId],
      organizationId,
    );

    if (errMembers)
      throw new InternalServerError(
        errMembers,
        "api_errors.iam.organizations.isr_on_find",
      );

    const member = members.at(0);

    if (!member) throw new MemberNotFoundException();

    if (member.role.isOwner()) throw new MemberIsOwnerException();

    const [, errSaving] =
      await this.groupMemberRepository.deleteByMemberAndGroupIds(
        organizationId,
        cmd.memberId,
        cmd.groupIds,
      );

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "api_errors.iam.members.isr_on_unassign_group",
      );
  }
}
