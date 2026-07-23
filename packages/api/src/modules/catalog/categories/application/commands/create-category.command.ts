import { z } from "zod";
import { ORPCError } from "@orpc/client";

import { slugify } from "@fludge/utils/slugify";
import type { PGCategoryRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/pg-category.repository";

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

  description: z.preprocess(
    (val) => (val === "" ? null : val),
    z
      .string()
      .min(5, {
        error: "La descripción es muy corta",
      })
      .max(255, {
        error: "La descripción es muy larga",
      })
      .nullable(),
  ),
});

type CMD = z.infer<typeof createCategoryCommand> & {
  organizationId: string;
  createdBy: {
    memberId: string;
  } | null;
};

export class CreateCategoryCommand {
  constructor(
    private readonly categoriesCommandsRepository: PGCategoryRepository,
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
        cmd.organizationId,
      );

    if (errorNameExists)
      throw new ORPCError("INTERNAL_SERVER_ERROR", errorNameExists);

    if (nameExists)
      throw new ORPCError("CONFLICT", {
        message: "Ya existe una categoría con ese nombre",
      });

    // 4. Save
    const [data, error] = await this.categoriesCommandsRepository.save({
      name: cmd.name,
      description: cmd.description,
      slug,
      organizationId: cmd.organizationId,
      createdBy: cmd.createdBy?.memberId,
    });

    if (error || !data)
      throw new ORPCError(
        "INTERNAL_SERVER_ERROR",
        error ?? {
          message: "Error creando categoría",
        },
      );

    return data;
  }
}
