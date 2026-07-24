import type { PGCategoryRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/pg-category.repository";
import {
  createProductCommand,
  productPresentationSchema,
} from "@fludge/api/modules/catalog/products/application/commands/create-product.command";
import type { ProductService } from "@fludge/api/modules/catalog/products/application/services/product.service";
import type { PGProductPresentationRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/pg-product-presentation.repository";
import type { PGProductRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/pg-product.repository";
import { slugify } from "@fludge/utils/slugify";
import { ORPCError } from "@orpc/server";
import { z } from "zod";

export const updateProductCommand = createProductCommand.extend({
  id: z.uuid({
    error: "El id del producto es requerido",
  }),
  presentation: z
    .array(
      productPresentationSchema.extend({
        id: z.uuid({
          error: "El id de la presentación es requerido",
        }),
      }),
    )
    .min(1, {
      error: "La presentación es requerida",
    }),
});

type CMD = z.infer<typeof updateProductCommand> & {
  organizationId: string;
  updatedBy: {
    memberId: string;
  };
};

export class UpdateProductCommand {
  constructor(
    private readonly productRepository: PGProductRepository,
    private readonly productPresentationRepository: PGProductPresentationRepository,
    private readonly categoryRepository: PGCategoryRepository,
    private readonly productService: ProductService,
  ) {}

  public async execute(cmd: CMD) {
    const [existing, errorExists] = await this.productRepository.findOne(
      cmd.id,
      cmd.organizationId,
    );

    if (errorExists) throw new ORPCError("INTERNAL_SERVER_ERROR", errorExists);

    if (!existing)
      throw new ORPCError("NOT_FOUND", {
        message: "No se encontró el producto",
      });

    if (existing.status !== "active")
      throw new ORPCError("FORBIDDEN", {
        message: "El producto está desactivado o descontinuado",
      });

    const newSlug = slugify(cmd.name);

    if (existing.name !== cmd.name) {
      const [slugAvailable, errorSlugAvailable] =
        await this.productService.checkUniqueFields(
          {
            name: cmd.name,
            slug: newSlug,
          },
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

    if (cmd.categoryId && existing.categoryId !== cmd.categoryId) {
      const [category, errorCategory] = await this.categoryRepository.findOne(
        cmd.categoryId,
        cmd.organizationId,
      );

      if (errorCategory)
        throw new ORPCError("INTERNAL_SERVER_ERROR", errorCategory);

      if (!category)
        throw new ORPCError("NOT_FOUND", {
          message: "La categoría no existe",
        });
    }

    await this.productRepository.transaction(async (tx) => {
      const [updatedProduct, errorUpdatingProduct] =
        await this.productRepository.update(
          cmd.id,
          cmd.organizationId,
          {
            updatedAt: new Date(),
            slug: newSlug,
            searchName: cmd.name,
            ...cmd,
          },
          { tx },
        );

      if (errorUpdatingProduct)
        throw new ORPCError("INTERNAL_SERVER_ERROR", errorUpdatingProduct);

      if (!updatedProduct)
        throw new ORPCError("NOT_FOUND", {
          message: "No se encontró el producto",
        });

      const [presentationsUpdated, errorUpdatingPresentation] =
        await this.productPresentationRepository.save(
          cmd.presentation.map((p) => ({
            productId: updatedProduct.id,
            organizationId: cmd.organizationId,
            updatedAt: new Date(),
            ...p,
          })),
          { tx },
        );

      if (errorUpdatingPresentation)
        throw new ORPCError(
          "INTERNAL_SERVER_ERROR",
          errorUpdatingPresentation ?? {
            message: "Error actualizando presentación",
          },
        );

      return { ...updatedProduct, presentations: presentationsUpdated };
    });
  }
}
