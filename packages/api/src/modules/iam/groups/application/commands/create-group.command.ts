import { z } from "zod";

import type { EventBus } from "@fludge/api/modules/shared/domain/event-bus";
import type { OrganizationRegisteredEvent } from "@fludge/api/modules/shared/domain/events";
import type { PGGroupsCommandsRepository } from "@fludge/api/modules/iam/groups/infrastructure/repositories/pg-groups-commands.repository";
import { ORPCError } from "@orpc/client";
import { slugify } from "@fludge/utils/slugify";
import { ALL_PERMISSIONS } from "@fludge/utils/permissions/index";

export const createGroupCommand = z.object({
  name: z
    .string({
      error: "El nombre es requerido",
    })
    .min(3, {
      error: "El nombre es muy corto",
    })
    .max(50, {
      error: "El nombre es muy largo",
    }),
  permissions: z.enum(ALL_PERMISSIONS).array().min(1, {
    error: "Debes asignar al menos un permiso",
  }),
  description: z.string().optional(),
});

type CMD = z.infer<typeof createGroupCommand> & {
  organizationId: string;
  memberId: string | null;
};

export class CreateGroupCommand {
  constructor(
    private readonly eventBus: EventBus,
    private readonly groupsCommandsRepository: PGGroupsCommandsRepository,
  ) {
    this.registerListeners();
  }

  public async execute(cmd: CMD) {
    const [data, error] = await this.groupsCommandsRepository.save({
      name: cmd.name,
      slug: slugify(cmd.name),
      organizationId: cmd.organizationId,
      permissions: cmd.permissions,
      description: cmd.description,
      createdBy: cmd.memberId,
    });

    if (error || !data)
      throw new ORPCError(
        "INTERNAL_SERVER_ERROR",
        error ?? {
          message: "Error creando grupo",
        },
      );

    return data;
  }

  private async registerListeners() {
    this.eventBus.register<OrganizationRegisteredEvent>(
      "organization:registered",
      (event) => {
        this.execute({
          organizationId: event.organizationId,
          name: "Administradores",
          permissions: ALL_PERMISSIONS,
          memberId: event.memberId,
        });
      },
      {
        critical: true,
        listenerName: "CreateGroupCommand",
      },
    );
  }
}
