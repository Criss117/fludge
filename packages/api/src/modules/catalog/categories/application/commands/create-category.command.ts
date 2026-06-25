import { z } from "zod";
import { ORPCError } from "@orpc/client";

import { slugify } from "@fludge/utils/slugify";
import type { PGCategoriesCommandsRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/pg-categories-commands.repository";

export const createCategoryCommand = z.object({
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
  parentId: z
    .uuid({
      error: "El id de la categoría padre no es válido",
    })
    .optional(),
});

type CMD = z.infer<typeof createCategoryCommand> & {
  organizationId: string;
  createdBy: {
    memberId: string;
    name: string;
    email: string;
  } | null;
};

export class CreateCategoryCommand {
  constructor(
    private readonly categoriesCommandsRepository: PGCategoriesCommandsRepository,
  ) {}

  public async execute(cmd: CMD) {
    const slug = slugify(cmd.name);

    // 1. Slug uniqueness
    const [slugAvailable, errorSlugAvailable] =
      await this.categoriesCommandsRepository.slugAvailable(
        slug,
        cmd.organizationId,
      );

    if (errorSlugAvailable)
      throw new ORPCError("INTERNAL_SERVER_ERROR", errorSlugAvailable);

    if (!slugAvailable)
      throw new ORPCError("CONFLICT", {
        message: "El slug ya está en uso",
      });

    // 2. Name uniqueness within parent scope
    const [nameExists, errorNameExists] =
      await this.categoriesCommandsRepository.exists(
        cmd.name,
        cmd.parentId ?? null,
        cmd.organizationId,
      );

    if (errorNameExists)
      throw new ORPCError("INTERNAL_SERVER_ERROR", errorNameExists);

    if (nameExists)
      throw new ORPCError("CONFLICT", {
        message: "Ya existe una categoría con ese nombre",
      });

    // 3. Parent validation (if provided)
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

      if (errorDepth) throw new ORPCError("INTERNAL_SERVER_ERROR", errorDepth);

      if (depth > 1)
        throw new ORPCError("BAD_REQUEST", {
          message:
            "No se puede crear una categoría de nivel 3, el máximo permitido es 2",
        });
    }

    // 4. Save
    const [data, error] = await this.categoriesCommandsRepository.save({
      name: cmd.name,
      slug,
      organizationId: cmd.organizationId,
      parentId: cmd.parentId ?? null,
      createdBy: cmd.createdBy?.memberId,
    });

    if (error || !data)
      throw new ORPCError(
        "INTERNAL_SERVER_ERROR",
        error ?? {
          message: "Error creando categoría",
        },
      );

    return {
      ...data,
      createdBy: cmd.createdBy,
    };
  }
}
