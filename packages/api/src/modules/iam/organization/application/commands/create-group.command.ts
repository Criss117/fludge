import type { z } from "zod";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { Group } from "@fludge/api/modules/iam/organization/domain/entities/group.entity";
import { UUID } from "@fludge/utils/uuid";
import { ORPCError } from "@orpc/server";
import type { GroupRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/group.repository";
import { Permissions } from "@fludge/utils/permissions/index";
import { createGroupValidator } from "@fludge/utils/validators/group.validators";

export const createGroupCommand = createGroupValidator;

type CMD = z.infer<typeof createGroupCommand>;

export class CreateGroupCommand {
  constructor(private readonly groupRepository: GroupRepository) {}

  public async execute(
    loggedUserId: string,
    activeOrganization: Organization,
    cmd: CMD,
  ) {
    const loggedMember = activeOrganization.members.getMemberByUserId(
      UUID.fromString(loggedUserId),
    )!;

    const newGroup = Group.create({
      name: cmd.name,
      description: cmd.description,
      permissions: Permissions.fromList(cmd.permissions),
      createdBy: loggedMember.id,
    });

    activeOrganization.groups.addGroup(newGroup);

    const [, errSaving] = await this.groupRepository.save(
      activeOrganization.id.toString(),
      newGroup,
    );

    if (errSaving)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al guardar la organización",
        cause: errSaving.cause,
      });

    return activeOrganization.values;
  }
}
