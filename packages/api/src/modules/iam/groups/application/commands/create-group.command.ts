import { z } from "zod";

import type { EventBus } from "@fludge/api/modules/shared/domain/event-bus";
import type { OrganizationRegisteredEvent } from "@fludge/api/modules/shared/domain/events";
import type { PGGroupRepository } from "@fludge/api/modules/iam/groups/infrastructure/repositories/pg-group.repository";
import { ORPCError } from "@orpc/server";
import { slugify } from "@fludge/utils/slugify";
import {
  ALL_PERMISSIONS,
  preparePermissions,
} from "@fludge/utils/permissions/index";
import type { GroupsChecksService } from "@fludge/api/modules/iam/groups/application/services/groups-checks.service";

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
  createdBy: {
    memberId: string;
  } | null;
};

export class CreateGroupCommand {
  constructor(
    private readonly eventBus: EventBus,
    private readonly groupRepository: PGGroupRepository,
    private readonly groupsChecksService: GroupsChecksService,
  ) {
    this.registerListeners();
  }

  public async execute(cmd: CMD) {
    const [fieldCheck, errorFieldCheck] =
      await this.groupsChecksService.checkUniqueFields(
        {
          slug: slugify(cmd.name),
          name: cmd.name,
        },
        cmd.organizationId,
      );

    if (errorFieldCheck)
      throw new ORPCError("INTERNAL_SERVER_ERROR", errorFieldCheck);

    if (!fieldCheck.slugTaken)
      throw new ORPCError("CONFLICT", {
        message: "El slug del grupo ya esta en uso",
      });

    if (!fieldCheck.nameTaken)
      throw new ORPCError("CONFLICT", {
        message: "El nombre del grupo ya esta en uso",
      });

    const [data, error] = await this.groupRepository.save({
      name: cmd.name,
      slug: slugify(cmd.name),
      organizationId: cmd.organizationId,
      permissions: preparePermissions(cmd.permissions),
      description: cmd.description,
      createdBy: cmd.createdBy?.memberId,
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
          createdBy: event.createdBy,
        });
      },
      {
        critical: true,
        listenerName: "CreateGroupCommand",
      },
    );
  }
}
