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
    return this.categoriesCommandsRepository.transaction(async (tx) => {
      let deletedCount = 0;

      for (const id of cmd.ids) {
        // Pre-check: fetch category to get its name for potential error message
        const [cat, catError] =
          await this.categoriesCommandsRepository.findOne(
            id,
            cmd.organizationId,
          );

        if (catError)
          throw new ORPCError("INTERNAL_SERVER_ERROR", catError);

        if (!cat) {
          // Category not found or already hard-deleted — skip silently
          continue;
        }

        // Orphan guard: reject if this category has active children
        const [childCount, childrenError] =
          await this.categoriesCommandsRepository.hasActiveChildren(
            id,
            cmd.organizationId,
            { tx },
          );

        if (childrenError)
          throw new ORPCError("INTERNAL_SERVER_ERROR", childrenError);

        if (childCount > 0)
          throw new ORPCError("BAD_REQUEST", {
            message: `No se puede eliminar la categoría "${cat.name}" porque tiene ${childCount} subcategoría(s) activa(s). Elimina primero las subcategorías.`,
          });

        const [, error] = await this.categoriesCommandsRepository.hardDelete(
          id,
          cmd.organizationId,
          { tx },
        );

        if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

        deletedCount++;
      }

      return deletedCount;
    });
  }
}