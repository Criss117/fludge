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