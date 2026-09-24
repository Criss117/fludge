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
import type { GroupMember } from "@fludge/api/core/iam/domain/entities/group-member.entity";

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

    const [group, errGroup] = await this.groupRepository.findById(
      organizationId,
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

    const groupMembersToRemove: GroupMember[] = [];

    for (const member of members) {
      const groupMembers = group.getGroupMemberByMemberId(member.id);

      if (!groupMembers) continue;

      group.removeGroupMember(groupMembers);

      groupMembersToRemove.push(groupMembers);
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

        const [, errUpdate] = await this.groupRepository.saveOnlyGroup(group, {
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

    return group;
  }
}
