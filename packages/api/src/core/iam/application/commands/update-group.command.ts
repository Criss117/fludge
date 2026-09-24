import type { z } from "zod";
import type { GroupUniquenessValidator } from "@fludge/api/core/iam/application/services/group-uniqueness-validator.service";
import type { UserAuthContext } from "@fludge/api/core/iam/domain/entities/user-auth-context.entity";
import { GroupAlreadyExistsException } from "@fludge/api/core/iam/domain/exceptions/group-already-exists.exception";
import { GroupNotFoundException } from "@fludge/api/core/iam/domain/exceptions/group-not-found.exception";
import type { GroupRepository } from "@fludge/api/core/iam/domain/repositories/group.repository";
import { InternalServerError } from "@fludge/api/core/shared/exceptions/base-exception";
import { Permissions } from "@fludge/utils/permissions/index";
import { Slug } from "@fludge/utils/slugify";
import { updateGroupValidator } from "@fludge/utils/validators/group.validators";

export const updateGroupCommand = updateGroupValidator;

type CMD = z.infer<typeof updateGroupCommand>;

export class UpdateGroupCommand {
  constructor(
    private readonly groupUniquenessValidator: GroupUniquenessValidator,
    private readonly groupRepository: GroupRepository,
  ) {}

  public async execute(authContext: UserAuthContext, cmd: CMD) {
    const [group, errGroup] = await this.groupRepository.findById(
      authContext.organizationId.toString(),
      cmd.id,
    );

    if (errGroup)
      throw new InternalServerError(
        errGroup,
        "api_errors.iam.organizations.isr_on_find",
      );

    if (!group) throw new GroupNotFoundException();

    if (cmd.name && cmd.name !== group.values.name) {
      const [uniqueness, errUniqueness] =
        await this.groupUniquenessValidator.validateUniqueFields(
          authContext.organizationId.toString(),
          {
            name: cmd.name,
            slug: new Slug(cmd.name).toString(),
          },
          cmd.id,
        );

      if (errUniqueness)
        throw new InternalServerError(
          errUniqueness,
          "api_errors.iam.organizations.isr_on_find",
        );

      if (uniqueness.nameTaken || uniqueness.slugTaken)
        throw new GroupAlreadyExistsException(
          "api_errors.iam.groups.name_taken",
        );
    }

    group.update({
      name: cmd.name,
      description: cmd.description,
      permissions: cmd.permissions
        ? Permissions.fromList(cmd.permissions)
        : undefined,
      status: cmd.status,
    });

    const [, errSaving] = await this.groupRepository.saveOnlyGroup(group);

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "api_errors.iam.organizations.isr_on_save",
      );

    return group.values;
  }
}
