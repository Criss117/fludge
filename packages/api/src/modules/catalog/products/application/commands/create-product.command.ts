import { z } from "zod";
import { ORPCError } from "@orpc/server";

import { slugify } from "@fludge/utils/slugify";
import type { PGProductRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/pg-product.repository";
import type { PGCategoryRepository } from "@fludge/api/modules/catalog/categories/infrastructure/repositories/pg-category.repository";
import type { ProductService } from "@fludge/api/modules/catalog/products/application/services/product.service";
import type { PGProductPresentationRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/pg-product-presentation.repository";

const productPresentationSchema = z
  .object({
    name: z
      .string({
        error: "El nombre de la presentación es requerido",
      })
      .min(3, {
        error: "El nombre de la presentación es muy corto",
      })
      .max(50, {
        error: "El nombre de la presentación es muy largo",
      }),
    barcode: z
      .string({
        error: "El código de barras de la presentación es requerido",
      })
      .min(5, {
        error: "El código de barras de la presentación es muy corto",
      })
      .max(50, {
        error: "El código de barras de la presentación es muy largo",
      })
      .nullable(),
    unitLabel: z
      .string({
        error: "El nombre de la unidad de la presentación es requerido",
      })
      .min(3, {
        error: "El nombre de la unidad de la presentación es muy corto",
      })
      .max(50, {
        error: "El nombre de la unidad de la presentación es muy largo",
      }),
    conversionFactor: z.int().positive().min(1, {
      error: "El factor de conversión es requerido",
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
      })
      .nullable(),
    priceWholesale: z
      .string({ error: "El precio mayorista es requerido" })
      .regex(/^\d+(\.\d{1,2})?$/, {
        error: "El precio mayorista no es válido",
      })
      .nullable(),
  })
  .refine(
    (data) =>
      data.pricePurchase !== null && data.pricePurchase <= data.priceRetail,
    {
      path: ["priceRetail"],
      message:
        "El precio de venta debe ser menor o igual que el precio de compra",
    },
  )
  .refine(
    (data) =>
      data.priceWholesale !== null && data.priceWholesale <= data.priceRetail,
    {
      path: ["priceWholesale"],
      message:
        "El precio mayorista debe ser menor o igual que el precio de venta",
    },
  );

export const createProductCommand = z
  .object({
    categoryId: z.uuid().nullable(),
    barcode: z
      .string({
        error: "El código de barras es requerido",
      })
      .min(5, {
        error: "El código de barras es muy corto",
      })
      .max(50, {
        error: "El código de barras es muy largo",
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

    notes: z.preprocess(
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

    stockQuantity: z.int().positive().min(1, {
      error: "La cantidad de stock es requerida",
    }),

    minimumStock: z
      .int()
      .positive()
      .min(0, {
        error: "El stock mínimo es requerido",
      })
      .default(0),

    allowNegativeStock: z.boolean().default(false),

    presentation: z.array(productPresentationSchema).min(1, {
      error: "La presentación es requerida",
    }),
  })
  .refine(
    (data) => data.allowNegativeStock === false && data.minimumStock >= 0,
    {
      path: ["minimumStock"],
      message: "El stock mínimo no puede ser 0",
    },
  )
  .refine(
    (data) =>
      data.allowNegativeStock === false &&
      data.stockQuantity >= data.minimumStock,
    {
      path: ["stockQuantity"],
      message: "El stock mínimo no puede ser mayor al stock actual",
    },
  );

type CMD = z.infer<typeof createProductCommand> & {
  organizationId: string;
  createdBy: string;
};

export class CreateProductCommand {
  constructor(
    private readonly productRepository: PGProductRepository,
    private readonly productPresentationRepository: PGProductPresentationRepository,
    private readonly categoryRepository: PGCategoryRepository,
    private readonly productService: ProductService,
  ) {}

  public async execute(cmd: CMD) {
    const slug = slugify(cmd.name);

    const [check, errorCheck] = await this.productService.checkUniqueFields(
      {
        slug,
        barcode: cmd.barcode,
        name: cmd.name,
      },
      cmd.organizationId,
    );

    if (errorCheck) throw new ORPCError("INTERNAL_SERVER_ERROR", errorCheck);

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

    // 5. Category validation (only when provided)
    if (cmd.categoryId) {
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

    this.productRepository.transaction(async (tx) => {
      const [productCreated, errorCreatingProduct] =
        await this.productRepository.save(
          {
            name: cmd.name,
            searchName: cmd.name,
            slug,
            organizationId: cmd.organizationId,
            categoryId: cmd.categoryId,
            barcode: cmd.barcode,
            description: cmd.description,
            minimumStock: cmd.minimumStock,
            allowNegativeStock: cmd.allowNegativeStock,
            stockQuantity: cmd.stockQuantity,
            createdBy: cmd.createdBy,
          },
          { tx },
        );

      if (errorCreatingProduct || !productCreated)
        throw new ORPCError(
          "INTERNAL_SERVER_ERROR",
          errorCreatingProduct ?? {
            message: "Error creando producto",
          },
        );

      const [, errorCreatingPresentation] =
        await this.productPresentationRepository.save(
          cmd.presentation.map((p) => ({
            productId: productCreated.id,
            organizationId: cmd.organizationId,
            ...p,
          })),
        );

      if (errorCreatingPresentation)
        throw new ORPCError(
          "INTERNAL_SERVER_ERROR",
          errorCreatingPresentation ?? {
            message: "Error creando presentación",
          },
        );

      return productCreated;
    });
  }
}
