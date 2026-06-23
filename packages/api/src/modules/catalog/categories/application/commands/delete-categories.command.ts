import { z } from "zod";
import { ORPCError } from "@orpc/client";

import type { PGCategoriesCommandsRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/pg-categories-commands.repository";

export const deleteCategoriesCommand = z.object({
  ids: z
    .array(
      z.uuid({
        error: "Id de categoría no válido",
      }),
    )
    .min(1, {
      error: "Debe especificar al menos un id de categoría",
    }),
});

type DeleteCMD = z.infer<typeof deleteCategoriesCommand> & {
  organizationId: string;
};

export class HardDeleteCategoriesCommand {
  constructor(
    private readonly categoriesCommandsRepository: PGCategoriesCommandsRepository,
  ) {}

  public async execute(cmd: DeleteCMD) {
    let deletedCount = 0;

    for (const id of cmd.ids) {
      const [, error] = await this.categoriesCommandsRepository.hardDelete(
        id,
        cmd.organizationId,
      );

      if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

      deletedCount++;
    }

    return deletedCount;
  }
}

export const activateCategoriesCommand = z.object({
  ids: z
    .array(
      z.uuid({
        error: "Id de categoría no válido",
      }),
    )
    .min(1, {
      error: "Debe especificar al menos un id de categoría",
    }),
});

type ActivateCMD = z.infer<typeof activateCategoriesCommand> & {
  organizationId: string;
};

export class ActivateCategoriesCommand {
  constructor(
    private readonly categoriesCommandsRepository: PGCategoriesCommandsRepository,
  ) {}

  public async execute(cmd: ActivateCMD) {
    for (const id of cmd.ids) {
      const [, error] = await this.categoriesCommandsRepository.activate(
        id,
        cmd.organizationId,
      );

      if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);
    }

    return null;
  }
}

export const deactivateCategoriesCommand = z.object({
  ids: z
    .array(
      z.uuid({
        error: "Id de categoría no válido",
      }),
    )
    .min(1, {
      error: "Debe especificar al menos un id de categoría",
    }),
});

type DeactivateCMD = z.infer<typeof deactivateCategoriesCommand> & {
  organizationId: string;
};

export class DeactivateCategoriesCommand {
  constructor(
    private readonly categoriesCommandsRepository: PGCategoriesCommandsRepository,
  ) {}

  public async execute(cmd: DeactivateCMD) {
    for (const id of cmd.ids) {
      const [, error] = await this.categoriesCommandsRepository.deactivate(
        id,
        cmd.organizationId,
      );

      if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);
    }

    return null;
  }
}