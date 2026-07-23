import { z } from "zod";
import { ORPCError } from "@orpc/client";

import { slugify } from "@fludge/utils/slugify";
import type { PGCategoryRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/pg-category.repository";
import { createCategoryCommand } from "@fludge/api/modules/catalog/categories/application/commands/create-category.command";

export const updateCategoryCommand = createCategoryCommand.extend({
  id: z.uuid({
    error: "El id de la categoría es requerido",
  }),
  deletedAt: z.date().nullable().optional(),
});

type CMD = z.infer<typeof updateCategoryCommand> & {
  organizationId: string;
};

export class UpdateCategoryCommand {
  constructor(private readonly categoryRepository: PGCategoryRepository) {}

  public async execute(cmd: CMD) {
    const [existingCategory, errorExists] =
      await this.categoryRepository.findOne(cmd.id, cmd.organizationId);

    if (errorExists) throw new ORPCError("INTERNAL_SERVER_ERROR", errorExists);

    if (!existingCategory)
      throw new ORPCError("NOT_FOUND", {
        message: "Categoría no encontrada",
      });

    if (existingCategory.name !== cmd.name) {
      const [slugAvailable, errorSlugAvailable] =
        await this.categoryRepository.slugAvailable(
          slugify(cmd.name),
          cmd.organizationId,
          cmd.id,
        );

      if (errorSlugAvailable)
        throw new ORPCError("INTERNAL_SERVER_ERROR", errorSlugAvailable);

      if (!slugAvailable)
        throw new ORPCError("CONFLICT", {
          message: "El slug ya está en uso",
        });
    }

    const [updated, error] = await this.categoryRepository.update(
      cmd.id,
      cmd.organizationId,
      {
        name: existingCategory.name,
        slug: existingCategory.slug,
        deletedAt: cmd.deletedAt,
      },
    );

    if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    if (!updated)
      throw new ORPCError("NOT_FOUND", {
        message: "Categoría no encontrada",
      });

    return updated;
  }
}
