import { z } from "zod";
import { ORPCError } from "@orpc/client";

import { slugify } from "@fludge/utils/slugify";
import type { PGCategoriesCommandsRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/pg-categories-commands.repository";
import { createCategoryCommand } from "@fludge/api/modules/catalog/categories/application/commands/create-category.command";

export const updateCategoryCommand = createCategoryCommand.extend({
  id: z.uuid({
    error: "El id de la categoría es requerido",
  }),
});

type CMD = z.infer<typeof updateCategoryCommand> & {
  organizationId: string;
};

export class UpdateCategoryCommand {
  constructor(
    private readonly categoriesCommandsRepository: PGCategoriesCommandsRepository,
  ) {}

  public async execute(cmd: CMD) {
    const [existingCategory, errorExists] =
      await this.categoriesCommandsRepository.findOne(
        cmd.id,
        cmd.organizationId,
      );

    if (errorExists)
      throw new ORPCError("INTERNAL_SERVER_ERROR", errorExists);

    if (!existingCategory)
      throw new ORPCError("NOT_FOUND", {
        message: "Categoría no encontrada",
      });

    const newParentId = cmd.parentId ?? null;

    // 1. Name changed → re-slugify and validate uniqueness
    if (existingCategory.name !== cmd.name) {
      const slug = slugify(cmd.name);

      const [slugAvailable, errorSlugAvailable] =
        await this.categoriesCommandsRepository.slugAvailable(
          slug,
          cmd.organizationId,
          cmd.id,
        );

      if (errorSlugAvailable)
        throw new ORPCError("INTERNAL_SERVER_ERROR", errorSlugAvailable);

      if (!slugAvailable)
        throw new ORPCError("CONFLICT", {
          message: "El slug ya está en uso",
        });

      const [nameExists, errorNameExists] =
        await this.categoriesCommandsRepository.exists(
          cmd.name,
          newParentId,
          cmd.organizationId,
          cmd.id,
        );

      if (errorNameExists)
        throw new ORPCError("INTERNAL_SERVER_ERROR", errorNameExists);

      if (nameExists)
        throw new ORPCError("CONFLICT", {
          message: "Ya existe una categoría con ese nombre",
        });
    }

    // 2. Parent changed → validate it exists and check depth
    if (existingCategory.parentId !== newParentId) {
      if (cmd.id === cmd.parentId)
        throw new ORPCError("BAD_REQUEST", {
          message: "Una categoría no puede ser su propia padre",
        });

      if (cmd.parentId) {
        const [parent, errorParent] =
          await this.categoriesCommandsRepository.findOne(
            cmd.parentId,
            cmd.organizationId,
          );

        if (errorParent)
          throw new ORPCError("INTERNAL_SERVER_ERROR", errorParent);

        if (!parent)
          throw new ORPCError("NOT_FOUND", {
            message: "La categoría padre no existe",
          });

        const [depth, errorDepth] =
          await this.categoriesCommandsRepository.parentDepth(cmd.parentId);

        if (errorDepth)
          throw new ORPCError("INTERNAL_SERVER_ERROR", errorDepth);

        if (depth > 1)
          throw new ORPCError("BAD_REQUEST", {
            message:
              "No se puede mover la categoría a un nivel 3, el máximo permitido es 2",
          });
      }

      // Re-check name uniqueness under the new parent scope
      const [nameExists, errorNameExists] =
        await this.categoriesCommandsRepository.exists(
          cmd.name,
          newParentId,
          cmd.organizationId,
          cmd.id,
        );

      if (errorNameExists)
        throw new ORPCError("INTERNAL_SERVER_ERROR", errorNameExists);

      if (nameExists)
        throw new ORPCError("CONFLICT", {
          message: "Ya existe una categoría con ese nombre bajo ese padre",
        });
    }

    // 3. Update
    const slug = slugify(cmd.name);

    const [updated, error] = await this.categoriesCommandsRepository.update(
      cmd.id,
      cmd.organizationId,
      {
        name: cmd.name,
        slug,
        parentId: newParentId,
      },
    );

    if (error)
      throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    if (!updated)
      throw new ORPCError("NOT_FOUND", {
        message: "Categoría no encontrada",
      });

    return updated;
  }
}