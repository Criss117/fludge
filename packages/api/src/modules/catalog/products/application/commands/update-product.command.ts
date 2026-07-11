import { z } from "zod";
import { ORPCError } from "@orpc/client";

import { slugify } from "@fludge/utils/slugify";
import type { PGProductsCommandsRepository, ProductUpdatable } from "@fludge/api/modules/catalog/products/infrastructure/repositories/pg-products-commands.repository";
import type { PGCategoriesCommandsRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/pg-categories-commands.repository";

// Full PUT schema — no `.partial()`. All create fields are present with the
// same optionality as `createProductCommand`; `id` and `status` are required.
// Slugs are never accepted from the client — always derived from `cmd.name`.
export const updateProductCommand = z
  .object({
    id: z.uuid({
      error: "El id del producto es requerido",
    }),
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
    description: z.string().max(500).nullish(),
    imageUrl: z.url({ error: "La URL de la imagen no es válida" }).nullish(),
    categoryId: z
      .uuid({ error: "El id de la categoría no es válido" })
      .nullish(),
    sku: z.string().min(1).max(50).nullish(),
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
      .string({ error: "El precio de venta es requerido" })
      .regex(/^\d+(\.\d{1,2})?$/, {
        error: "El precio de venta no es válido",
      }),
    pricePurchase: z
      .string({ error: "El precio de compra es requerido" })
      .regex(/^\d+(\.\d{1,2})?$/, {
        error: "El precio de compra no es válido",
      }),
    priceWholesale: z
      .string({ error: "El precio mayorista es requerido" })
      .regex(/^\d+(\.\d{1,2})?$/, {
        error: "El precio mayorista no es válido",
      }),
    minimumStock: z.number().int().nonnegative().optional(),
    allowNegativeStock: z.boolean().optional(),
    stockQuantity: z.number().int().optional(),
    // Mirrors productStatusEnum in catalog.schema — keep in sync.
    status: z.enum(["active", "inactive", "discontinued"]),
  })
  .refine(
    (data) =>
      data.stockQuantity == null ||
      data.stockQuantity >= 0 ||
      data.allowNegativeStock === true,
    {
      error: "El stock no puede ser negativo si no se permite stock negativo",
      path: ["stockQuantity"],
    },
  )
  .refine(
    (data) =>
      data.stockQuantity == null ||
      data.minimumStock == null ||
      data.stockQuantity >= data.minimumStock,
    {
      error: "El stock mínimo no puede ser mayor al stock actual",
      path: ["minimumStock"],
    },
  );

type CMD = z.infer<typeof updateProductCommand> & {
  organizationId: string;
  updatedBy: {
    memberId: string;
  };
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

    // 2. Slug is always derived from the provided name
    const slug = slugify(cmd.name);

    // 3. Batched uniqueness check — single query covering slug, name, barcode,
    //    and sku. Excludes the product being updated by id.
    const [check, errorCheck] =
      await this.productsCommandsRepository.checkUniqueFields(
        {
          slug,
          name: cmd.name,
          barcode: cmd.barcode,
          sku: cmd.sku ?? undefined,
        },
        cmd.organizationId,
        cmd.id,
      );

    if (errorCheck)
      throw new ORPCError("INTERNAL_SERVER_ERROR", errorCheck);

    if (check.slugTaken)
      throw new ORPCError("CONFLICT", {
        message: "El slug ya está en uso",
      });

    if (check.nameTaken)
      throw new ORPCError("CONFLICT", {
        message: "Ya existe un producto con ese nombre",
      });

    if (check.barcodeTaken)
      throw new ORPCError("CONFLICT", {
        message: "Ya existe un producto con ese código de barras",
      });

    if (cmd.sku && check.skuTaken)
      throw new ORPCError("CONFLICT", {
        message: "Ya existe un producto con ese SKU",
      });

    // 4. Category validation (only when provided)
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

    // 5. Normalize negative stock when allowNegativeStock is false. The schema
    //    cannot see `existing`, so the handler computes the effective stock
    //    from `cmd ?? existing` and coerces to 0 when negative stock is not
    //    allowed.
    const effectiveAllowNegative =
      cmd.allowNegativeStock ?? existing.allowNegativeStock;
    const effectiveStock =
      cmd.stockQuantity ?? existing.stockQuantity;
    const normalizedStock =
      effectiveAllowNegative === false && effectiveStock < 0
        ? 0
        : effectiveStock;

    // 6. Build update payload directly from cmd (PUT semantics — full state).
    //    No `if (x !== undefined)` guards; every field is written.
    const values: ProductUpdatable = {
      name: cmd.name,
      slug,
      description: cmd.description ?? null,
      imageUrl: cmd.imageUrl ?? null,
      categoryId: cmd.categoryId ?? null,
      sku: cmd.sku ?? null,
      barcode: cmd.barcode,
      priceRetail: cmd.priceRetail,
      pricePurchase: cmd.pricePurchase,
      priceWholesale: cmd.priceWholesale,
      minimumStock: cmd.minimumStock ?? 0,
      allowNegativeStock: cmd.allowNegativeStock ?? false,
      status: cmd.status,
    };

    // Only write stockQuantity when it actually changed — avoids a redundant
    // DB write and gates the inventory movement below.
    if (normalizedStock !== existing.stockQuantity) {
      values.stockQuantity = normalizedStock;
    }

    // 7. Update + inventory movement (transactional)
    return this.productsCommandsRepository.transaction(async (tx) => {
      const [updated, error] = await this.productsCommandsRepository.update(
        cmd.id,
        cmd.organizationId,
        values,
        { tx },
      );

      if (error) throw new ORPCError("INTERNAL_SERVER_ERROR", error);

      if (!updated)
        throw new ORPCError("NOT_FOUND", {
          message: "Producto no encontrado",
        });

      if (normalizedStock !== existing.stockQuantity) {
        const [, mvError] =
          await this.productsCommandsRepository.insertInventoryMovement(
            {
              organizationId: cmd.organizationId,
              productId: cmd.id,
              type: "adjustment",
              quantity: normalizedStock - existing.stockQuantity,
              stockBefore: existing.stockQuantity,
              stockAfter: normalizedStock,
              referenceId: cmd.id,
              referenceType: "product",
              reason: "ajuste manual",
              actorId: cmd.updatedBy.memberId,
            },
            { tx },
          );

        if (mvError) throw new ORPCError("INTERNAL_SERVER_ERROR", mvError);
      }

      return updated;
    });
  }
}