import { z } from "zod";
import { ORPCError } from "@orpc/client";

import { slugify } from "@fludge/utils/slugify";
import type { PGCategoriesCommandsRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/pg-categories-commands.repository";
import { createCategoryCommand } from "@fludge/api/modules/catalog/categories/application/commands/create-category.command";

export const updateCategoryCommand = createCategoryCommand
  .partial()
  .extend({
    id: z.uuid({
      error: "El id de la categoría es requerido",
    }),
    // Tri-state, mirrors deletedAt:
    //   undefined => leave parent untouched (regular edit omits it)
    //   null      => clear parent (set parent_id = NULL)
    //   UUID      => move category to this parent
    parentId: z.uuid().nullable().optional(),
    // null  => activate  (clears deleted_at)
    // Date  => deactivate (sets deleted_at)
    // omitted => leave status untouched (regular edit)
    deletedAt: z.date().nullable().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.parentId !== undefined ||
      data.deletedAt !== undefined,
    {
      error: "Debe enviar al menos un campo para actualizar",
    },
  );

type CMD = z.infer<typeof updateCategoryCommand> & {
  organizationId: string;
};

export class UpdateCategoryCommand {
  constructor(
    private readonly categoriesCommandsRepository: PGCategoriesCommandsRepository,
  ) {}

  public async execute(cmd: CMD) {
    // 1. Existing category (allows soft-deleted for status recovery)
    const [existingCategory, errorExists] =
      await this.categoriesCommandsRepository.findOne(
        cmd.id,
        cmd.organizationId,
      );

    if (errorExists) throw new ORPCError("INTERNAL_SERVER_ERROR", errorExists);

    if (!existingCategory)
      throw new ORPCError("NOT_FOUND", {
        message: "Categoría no encontrada",
      });

    // 2. Status-only fast path: deletedAt present, name/parentId absent.
    //    Skip validation — only persist the status change.
    if (
      cmd.deletedAt !== undefined &&
      cmd.name === undefined &&
      cmd.parentId === undefined
    ) {
      const [updated, error] = await this.categoriesCommandsRepository.update(
        cmd.id,
        cmd.organizationId,
        {
          name: existingCategory.name,
          slug: existingCategory.slug,
          parentId: existingCategory.parentId,
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

    // 3. Resolve effective parent (undefined => preserve existing)
    const newParentId =
      cmd.parentId === undefined
        ? existingCategory.parentId
        : cmd.parentId;

    // 4. Name changed → re-slugify and validate uniqueness
    const effectiveName = cmd.name ?? existingCategory.name;
    const nameChanged =
      cmd.name !== undefined && cmd.name !== existingCategory.name;
    const slug = nameChanged
      ? slugify(effectiveName)
      : existingCategory.slug;

    if (nameChanged) {
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
          effectiveName,
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

    // 5. Parent changed → cycle detection, validate parent active, check depth
    const parentChanged =
      cmd.parentId !== undefined &&
      cmd.parentId !== existingCategory.parentId;

    if (parentChanged) {
      if (cmd.id === cmd.parentId)
        throw new ORPCError("BAD_REQUEST", {
          message: "Una categoría no puede ser su propia padre",
        });

      if (cmd.parentId) {
        // 5a. Cycle detection — moving category under its own descendant
        const [hasCycle, errorCycle] =
          await this.categoriesCommandsRepository.wouldCreateCycle(
            cmd.id,
            cmd.parentId,
            cmd.organizationId,
          );

        if (errorCycle)
          throw new ORPCError("INTERNAL_SERVER_ERROR", errorCycle);

        if (hasCycle)
          throw new ORPCError("BAD_REQUEST", {
            message:
              "No se puede mover una categoría dentro de su propio sub-árbol",
          });

        // 5b. Parent must be active (not soft-deleted)
        const [parent, errorParent] =
          await this.categoriesCommandsRepository.findActiveOne(
            cmd.parentId,
            cmd.organizationId,
          );

        if (errorParent)
          throw new ORPCError("INTERNAL_SERVER_ERROR", errorParent);

        if (!parent)
          throw new ORPCError("NOT_FOUND", {
            message: "La categoría padre no existe o está eliminada",
          });

        // 5c. Depth check — max 2 levels
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

      // 5d. Re-check name uniqueness under the new parent scope
      //     (only if we didn't already check in step 4)
      if (!nameChanged) {
        const [nameExists, errorNameExists] =
          await this.categoriesCommandsRepository.exists(
            effectiveName,
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
    }

    // 6. Build update payload from provided fields only
    const [updated, error] = await this.categoriesCommandsRepository.update(
      cmd.id,
      cmd.organizationId,
      {
        name: effectiveName,
        slug,
        parentId: newParentId,
        ...(cmd.deletedAt !== undefined && { deletedAt: cmd.deletedAt }),
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