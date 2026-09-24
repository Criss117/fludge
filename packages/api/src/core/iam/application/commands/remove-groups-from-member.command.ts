import type { z } from "zod";
import type { UserAuthContext } from "@fludge/api/core/iam/domain/entities/user-auth-context.entity";
import { GroupNotFoundException } from "@fludge/api/core/iam/domain/exceptions/group-not-found.exception";
import { MemberIsOwnerException } from "@fludge/api/core/iam/domain/exceptions/member-is-owner.exception";
import { MemberNotFoundException } from "@fludge/api/core/iam/domain/exceptions/member-not-found.exception";
import type { GroupMemberRepository } from "@fludge/api/core/iam/domain/repositories/group-member.repository";
import type { GroupRepository } from "@fludge/api/core/iam/domain/repositories/group.repository";
import type { MemberRepository } from "@fludge/api/core/iam/domain/repositories/member.repository";
import { InternalServerError } from "@fludge/api/core/shared/exceptions/base-exception";
import { assignGroupsToMemberValidator } from "@fludge/utils/validators/member.validators";
import type { GroupMember } from "../../domain/entities/group-member.entity";

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

    const groupMembersToRemove: GroupMember[] = [];

    for (const group of groups) {
      const groupMember = group.getGroupMemberByMemberId(member.id);

      if (!groupMember) continue;

      group.removeGroupMember(groupMember);

      groupMembersToRemove.push(groupMember);
    }

    const [, errTransaction] = await this.groupRepository.transaction(
      async (tx) => {
        const [, errDelete] = await this.groupMemberRepository.delete(
          groupMembersToRemove,
          {
            tx,
          },
        );

        if (errDelete) throw errDelete;

        const [, errUpdate] = await this.groupRepository.saveOnlyGroup(groups, {
          tx,
        });

        if (errUpdate) throw errUpdate;
      },
    );

    if (errTransaction)
      throw new InternalServerError(
        errTransaction,
        "api_errors.iam.groups.isr_on_save",
      );

    return groups.map((g) => g.values);
  }
}
