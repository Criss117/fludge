import type { z } from "zod";
import type { UserAuthContext } from "@core/iam/domain/entities/user-auth-context.entity";
import type { GroupMemberRepository } from "@core/iam/domain/repositories/group-member.repository";
import type { GroupRepository } from "@core/iam/domain/repositories/group.repository";
import { InternalServerError } from "@core/shared/exceptions/base-exception";
import { deleteGroupsValidator } from "@fludge/utils/validators/group.validators";

export const deleteGroupsCommand = deleteGroupsValidator;

type CMD = z.infer<typeof deleteGroupsCommand>;

export class DeleteGroupsCommand {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly groupMemberRepository: GroupMemberRepository,
  ) {}

  public async execute(authContext: UserAuthContext, cmd: CMD) {
    const organizationId = authContext.organizationId.toString();

    const [, errTransaction] = await this.groupRepository.transaction(
      async (tx) => {
        const [, errDeleteGroupMembers] =
          await this.groupMemberRepository.deleteByGroupIds(
            organizationId,
            cmd.groupIds,
            { tx },
          );

        if (errDeleteGroupMembers) throw errDeleteGroupMembers;

        const [, errDeleteGroups] = await this.groupRepository.delete(
          organizationId,
          cmd.groupIds,
          { tx },
        );

        if (errDeleteGroups) throw errDeleteGroups;
      },
    );

    if (errTransaction)
      throw new InternalServerError(
        errTransaction,
        "api_errors.iam.groups.isr_on_delete",
      );
  }
}
