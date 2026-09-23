import type { z } from "zod";
import type { GroupUniquenessValidator } from "@core/iam/application/services/group-uniqueness-validator.service";
import { Group } from "@core/iam/domain/entities/group.entity";
import type { Organization } from "@core/iam/domain/entities/organization.entity";
import { GroupAlreadyExistsException } from "@core/iam/domain/exceptions/group-already-exists.exception";
import { MemberNotFoundException } from "@core/iam/domain/exceptions/member-not-found.exception";
import type { GroupRepository } from "@core/iam/domain/repositories/group.repository";
import type { MemberRepository } from "@core/iam/domain/repositories/member.repository";
import { InternalServerError } from "@core/shared/exceptions/base-exception";
import { Permissions } from "@fludge/utils/permissions/index";
import { createGroupValidator } from "@fludge/utils/validators/group.validators";

export const createGroupCommand = createGroupValidator;

type CMD = z.infer<typeof createGroupCommand>;

export class CreateGroupCommand {
  constructor(
    private readonly groupUniquenessValidator: GroupUniquenessValidator,
    private readonly groupRepository: GroupRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  public async execute(
    loggedUserId: string,
    activeOrganization: Organization,
    cmd: CMD,
  ) {
    const [loggedMember, errMember] = await this.memberRepository.findByUserId(
      loggedUserId,
      activeOrganization.id.toString(),
    );

    if (errMember)
      throw new InternalServerError(
        errMember,
        "api_errors.iam.organizations.isr_on_find",
      );

    if (!loggedMember) throw new MemberNotFoundException();

    const newGroup = Group.create({
      name: cmd.name,
      description: cmd.description,
      permissions: Permissions.fromList(cmd.permissions),
      createdBy: loggedMember.id,
      organizationId: activeOrganization.id,
    });

    const [uniqueness, errUniqueness] =
      await this.groupUniquenessValidator.validateUniqueFields(
        activeOrganization.id.toString(),
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
