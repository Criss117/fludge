import { z } from "zod";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { Group } from "@fludge/api/modules/iam/organization/domain/entities/group.entity";
import { UUID } from "@fludge/utils/uuid";
import { ORPCError } from "@orpc/server";
import type { PgGroupRepository } from "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-group.repository";
import {
  appStatementSchema,
  Permissions,
} from "@fludge/utils/permissions/index";

export const createGroupCommand = z.object({
  name: z.string({
    error: "El nombre es requerido",
  }),
  description: z.string({
    error: "La descripción es requerida",
  }),
  permissions: appStatementSchema,
});

type CMD = z.infer<typeof createGroupCommand>;

export class CreateGroupCommand {
  constructor(private readonly groupRepository: PgGroupRepository) {}

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
      permissions: Permissions.create(cmd.permissions),
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
