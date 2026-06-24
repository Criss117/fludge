import { z } from "zod";
import { ORPCError } from "@orpc/client";

import { slugify } from "@fludge/utils/slugify";
import type { PGProductsCommandsRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/pg-products-commands.repository";
import type { PGCategoriesCommandsRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/pg-categories-commands.repository";

export const createProductCommand = z.object({
  name: z
    .string({
      error: "El nombre es requerido",
    })
    .min(3, {
      error: "El nombre es muy corto",
    })
    .max(100, {
      error: "El nombre es muy largo",
    }),
  description: z.string().max(500).optional(),
  imageUrl: z
    .string()
    .url({ error: "La URL de la imagen no es válida" })
    .optional(),
  categoryId: z
    .uuid({ error: "El id de la categoría no es válido" })
    .optional(),
  sku: z.string().min(1).max(50).optional(),
  barcode: z
    .string({
      error: "El código de barras es requerido",
    })
    .min(1, {
      error: "El código de barras es requerido",
    })
    .max(50, {
      error: "El código de barras es muy largo",
    }),
  priceRetail: z
    .number({ error: "El precio de venta es requerido" })
    .positive({ error: "El precio de venta debe ser mayor a 0" }),
  pricePurchase: z
    .number({ error: "El precio de compra es requerido" })
    .nonnegative({ error: "El precio de compra no puede ser negativo" }),
  priceWholesale: z
    .number({ error: "El precio mayorista es requerido" })
    .nonnegative({ error: "El precio mayorista no puede ser negativo" }),
  minimumStock: z.number().int().nonnegative().optional(),
  allowNegativeStock: z.boolean().optional(),
});

type CMD = z.infer<typeof createProductCommand> & {
  organizationId: string;
  createdBy: string;
};

export class CreateProductCommand {
  constructor(
    private readonly productsCommandsRepository: PGProductsCommandsRepository,
    private readonly categoriesCommandsRepository: PGCategoriesCommandsRepository,
  ) {}

  public async execute(cmd: CMD) {
    const slug = slugify(cmd.name);

    // 1. Slug uniqueness
    const [slugAvailable, errorSlugAvailable] =
      await this.productsCommandsRepository.slugAvailable(
        slug,
        cmd.organizationId,
      );

    if (errorSlugAvailable)
      throw new ORPCError("INTERNAL_SERVER_ERROR", errorSlugAvailable);

    if (!slugAvailable)
      throw new ORPCError("CONFLICT", {
        message: "El slug ya está en uso",
      });

    // 2. Name uniqueness
    const [nameExists, errorNameExists] =
      await this.productsCommandsRepository.nameExists(
        cmd.name,
        cmd.organizationId,
      );

    if (errorNameExists)
      throw new ORPCError("INTERNAL_SERVER_ERROR", errorNameExists);

    if (nameExists)
      throw new ORPCError("CONFLICT", {
        message: "Ya existe un producto con ese nombre",
      });

    // 3. Barcode uniqueness
    const [barcodeExists, errorBarcodeExists] =
      await this.productsCommandsRepository.barcodeExists(
        cmd.barcode,
        cmd.organizationId,
      );

    if (errorBarcodeExists)
      throw new ORPCError("INTERNAL_SERVER_ERROR", errorBarcodeExists);

    if (barcodeExists)
      throw new ORPCError("CONFLICT", {
        message: "Ya existe un producto con ese código de barras",
      });

    // 4. SKU uniqueness (only when provided)
    if (cmd.sku) {
      const [skuExists, errorSkuExists] =
        await this.productsCommandsRepository.skuExists(
          cmd.sku,
          cmd.organizationId,
        );

      if (errorSkuExists)
        throw new ORPCError("INTERNAL_SERVER_ERROR", errorSkuExists);

      if (skuExists)
        throw new ORPCError("CONFLICT", {
          message: "Ya existe un producto con ese SKU",
        });
    }

    // 5. Category validation (only when provided)
    if (cmd.categoryId) {
      const [category, errorCategory] =
        await this.categoriesCommandsRepository.findOne(
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

    // 6. Save
    const [data, error] = await this.productsCommandsRepository.save({
      name: cmd.name,
      slug,
      organizationId: cmd.organizationId,
      categoryId: cmd.categoryId ?? null,
      sku: cmd.sku ?? null,
      barcode: cmd.barcode,
      description: cmd.description ?? null,
      imageUrl: cmd.imageUrl ?? null,
      priceRetail: String(cmd.priceRetail),
      pricePurchase: String(cmd.pricePurchase),
      priceWholesale: String(cmd.priceWholesale),
      minimumStock: cmd.minimumStock ?? 0,
      allowNegativeStock: cmd.allowNegativeStock ?? false,
      createdBy: cmd.createdBy,
    });

    if (error || !data)
      throw new ORPCError(
        "INTERNAL_SERVER_ERROR",
        error ?? {
          message: "Error creando producto",
        },
      );

    return data;
  }
}