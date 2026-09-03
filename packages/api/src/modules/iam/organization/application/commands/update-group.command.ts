import { Permissions } from "@fludge/utils/permissions/index";
import type { z } from "zod";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import type { GroupRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/group.repository";
import { UUID } from "@fludge/utils/uuid";
import { updateGroupValidator } from "@fludge/utils/validators/group.validators";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";

export const updateGroupCommand = updateGroupValidator;

type CMD = z.infer<typeof updateGroupCommand>;

export class UpdateGroupCommand {
  constructor(private readonly groupRepository: GroupRepository) {}

  public async execute(activeOrganization: Organization, cmd: CMD) {
    const updatedGroup = activeOrganization.groups.updateGroup(
      UUID.fromString(cmd.id),
      {
        description: cmd.description,
        permissions: cmd.permissions
          ? Permissions.fromList(cmd.permissions)
          : undefined,
        name: cmd.name,
        status: cmd.status,
      },
    );

    const [, errSaving] = await this.groupRepository.save(
      activeOrganization.id.toString(),
      updatedGroup,
    );

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "iam.organizations.errors.isr_on_save",
      );

    return activeOrganization.values;
  }
}
