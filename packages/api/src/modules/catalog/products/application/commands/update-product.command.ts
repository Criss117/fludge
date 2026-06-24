import { z } from "zod";
import { ORPCError } from "@orpc/client";

import { slugify } from "@fludge/utils/slugify";
import type { PGProductsCommandsRepository, ProductUpdatable } from "@fludge/api/modules/catalog/products/infrastructure/repositories/pg-products-commands.repository";
import type { PGCategoriesCommandsRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/pg-categories-commands.repository";
import { createProductCommand } from "@fludge/api/modules/catalog/products/application/commands/create-product.command";

export const updateProductCommand = createProductCommand
  .partial()
  .extend({
    id: z.uuid({
      error: "El id del producto es requerido",
    }),
    stockQuantity: z.number().int().nonnegative().optional(),
    // Mirrors productStatusEnum in catalog.schema — keep in sync.
    status: z.enum(["active", "inactive", "discontinued"]).optional(),
  });

type CMD = z.infer<typeof updateProductCommand> & {
  organizationId: string;
};

export class UpdateProductCommand {
  constructor(
    private readonly productsCommandsRepository: PGProductsCommandsRepository,
    private readonly categoriesCommandsRepository: PGCategoriesCommandsRepository,
  ) {}

  public async execute(cmd: CMD) {
    // 1. Existing product
    const [existing, errorExists] =
      await this.productsCommandsRepository.findOne(
        cmd.id,
        cmd.organizationId,
      );

    if (errorExists)
      throw new ORPCError("INTERNAL_SERVER_ERROR", errorExists);

    if (!existing)
      throw new ORPCError("NOT_FOUND", {
        message: "Producto no encontrado",
      });

    // 2. Name changed → re-slugify + uniqueness (exclude self)
    if (cmd.name !== undefined && cmd.name !== existing.name) {
      const slug = slugify(cmd.name);

      const [slugAvailable, errorSlugAvailable] =
        await this.productsCommandsRepository.slugAvailable(
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
        await this.productsCommandsRepository.nameExists(
          cmd.name,
          cmd.organizationId,
          cmd.id,
        );

      if (errorNameExists)
        throw new ORPCError("INTERNAL_SERVER_ERROR", errorNameExists);

      if (nameExists)
        throw new ORPCError("CONFLICT", {
          message: "Ya existe un producto con ese nombre",
        });
    }

    // 3. Barcode changed → uniqueness (exclude self)
    if (cmd.barcode !== undefined && cmd.barcode !== existing.barcode) {
      const [barcodeExists, errorBarcodeExists] =
        await this.productsCommandsRepository.barcodeExists(
          cmd.barcode,
          cmd.organizationId,
          cmd.id,
        );

      if (errorBarcodeExists)
        throw new ORPCError("INTERNAL_SERVER_ERROR", errorBarcodeExists);

      if (barcodeExists)
        throw new ORPCError("CONFLICT", {
          message: "Ya existe un producto con ese código de barras",
        });
    }

    // 4. SKU changed/added → uniqueness (exclude self)
    if (cmd.sku !== undefined && cmd.sku !== existing.sku) {
      const [skuExists, errorSkuExists] =
        await this.productsCommandsRepository.skuExists(
          cmd.sku,
          cmd.organizationId,
          cmd.id,
        );

      if (errorSkuExists)
        throw new ORPCError("INTERNAL_SERVER_ERROR", errorSkuExists);

      if (skuExists)
        throw new ORPCError("CONFLICT", {
          message: "Ya existe un producto con ese SKU",
        });
    }

    // 5. Category changed → validate it exists (only when a new one is set)
    if (
      cmd.categoryId !== undefined &&
      cmd.categoryId !== existing.categoryId &&
      cmd.categoryId
    ) {
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

    // 6. Build update payload from provided fields only
    const values: ProductUpdatable = {};

    if (cmd.name !== undefined) {
      values.name = cmd.name;
      values.slug = slugify(cmd.name);
    }
    if (cmd.description !== undefined)
      values.description = cmd.description ?? null;
    if (cmd.imageUrl !== undefined) values.imageUrl = cmd.imageUrl ?? null;
    if (cmd.categoryId !== undefined)
      values.categoryId = cmd.categoryId ?? null;
    if (cmd.sku !== undefined) values.sku = cmd.sku ?? null;
    if (cmd.barcode !== undefined) values.barcode = cmd.barcode;
    if (cmd.priceRetail !== undefined) values.priceRetail = cmd.priceRetail;
    if (cmd.pricePurchase !== undefined)
      values.pricePurchase = cmd.pricePurchase;
    if (cmd.priceWholesale !== undefined)
      values.priceWholesale = cmd.priceWholesale;
    if (cmd.minimumStock !== undefined)
      values.minimumStock = cmd.minimumStock;
    if (cmd.allowNegativeStock !== undefined)
      values.allowNegativeStock = cmd.allowNegativeStock;
    if (cmd.stockQuantity !== undefined) {
      // TODO: integrate with inventory movements
      values.stockQuantity = cmd.stockQuantity;
    }
    if (cmd.status !== undefined) values.status = cmd.status;

    // 7. Update
    const [updated, error] = await this.productsCommandsRepository.update(
      cmd.id,
      cmd.organizationId,
      values,
    );

    if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

    if (!updated)
      throw new ORPCError("NOT_FOUND", {
        message: "Producto no encontrado",
      });

    return updated;
  }
}