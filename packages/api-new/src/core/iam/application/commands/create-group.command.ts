import type { z } from "zod";
import type { GroupUniquenessValidator } from "@core/iam/application/services/group-uniqueness-validator.service";
import { Group } from "@core/iam/domain/entities/group.entity";
import { GroupAlreadyExistsException } from "@core/iam/domain/exceptions/group-already-exists.exception";
import type { GroupRepository } from "@core/iam/domain/repositories/group.repository";
import { InternalServerError } from "@core/shared/exceptions/base-exception";
import { Permissions } from "@fludge/utils/permissions/index";
import { UUID } from "@fludge/utils/uuid";
import { createGroupValidator } from "@fludge/utils/validators/group.validators";
import type { UserAuthContext } from "@core/iam/domain/entities/user-auth-context.entity";

export const createGroupCommand = createGroupValidator;

type CMD = z.infer<typeof createGroupCommand>;

export class CreateGroupCommand {
  constructor(
    private readonly groupUniquenessValidator: GroupUniquenessValidator,
    private readonly groupRepository: GroupRepository,
  ) {}

  public async execute(authContext: UserAuthContext, cmd: CMD) {
    const newGroup = Group.create({
      name: cmd.name,
      description: cmd.description,
      permissions: Permissions.fromList(cmd.permissions),
      createdBy: authContext.member.id,
      organizationId: UUID.fromString(authContext.organizationId.toString()),
    });

    const [uniqueness, errUniqueness] =
      await this.groupUniquenessValidator.validateUniqueFields(
        authContext.organizationId.toString(),
        {
          name: newGroup.values.name,
          slug: newGroup.values.slug,
        },
      );

    if (errUniqueness)
      throw new InternalServerError(
        errUniqueness,
        "api_errors.iam.organizations.isr_on_find",
      );

    if (uniqueness.nameTaken || uniqueness.slugTaken)
      throw new GroupAlreadyExistsException("api_errors.iam.groups.name_taken");

    const [, errSaving] = await this.groupRepository.insert(newGroup);

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "api_errors.iam.organizations.isr_on_save",
      );

    return newGroup.values;
  }
}
