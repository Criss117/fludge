import { z } from "zod";
import { ORPCError } from "@orpc/server";

import type { PGCategoryRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/pg-category.repository";

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
  constructor(private readonly categoryRepository: PGCategoryRepository) {}

  public async execute(cmd: DeleteCMD) {
    const [, error] = await this.categoryRepository.hardDelete(
      cmd.ids,
      cmd.organizationId,
    );

    if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    return null;
  }
}
