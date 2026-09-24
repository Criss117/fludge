import type { z } from "zod";
import type { UserAuthContext } from "@fludge/api/core/iam/domain/entities/user-auth-context.entity";
import type { GroupRepository } from "@fludge/api/core/iam/domain/repositories/group.repository";
import { InternalServerError } from "@fludge/api/core/shared/exceptions/base-exception";
import { deleteGroupsValidator } from "@fludge/utils/validators/group.validators";

export const deleteGroupsCommand = deleteGroupsValidator;

type CMD = z.infer<typeof deleteGroupsCommand>;

export class DeleteGroupsCommand {
  constructor(private readonly groupRepository: GroupRepository) {}

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
      throw new InternalServerError(
        new Error("api_errors.iam.groups.isr_on_find"),
        "api_errors.iam.groups.isr_on_find",
      );

    const [, errDeleteGroups] = await this.groupRepository.delete(groups);

    if (errDeleteGroups)
      throw new InternalServerError(
        errDeleteGroups,
        "api_errors.iam.groups.isr_on_delete",
      );

    return groups.map((g) => g.values);
  }
}
