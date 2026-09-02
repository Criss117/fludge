import { z } from "zod";
import { ORPCError } from "@orpc/server";

import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import type { EnsureCategoryExistsService } from "@fludge/api/modules/catalog/categories/application/services/ensure-category-exists.service";
import type { ProductUniquenessValidator } from "@fludge/api/modules/catalog/products/application/services/product-uniqueness-validator.service";
import type { ProductRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/product.repository";
import type { ProductPresentationRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/product-presentation.repository";
import {
  createProductCommand,
  createProductPresentationCommand,
} from "./create-product.command";
import { productStatusEnum } from "@fludge/db/schema/enums";
import { Slug } from "@fludge/utils/slugify";
import { tryCatch } from "@fludge/utils/trycatch";

export const updateProductPresentationCommand = createProductPresentationCommand
  .partial()
  .extend({
    id: z.uuid({
      error: "El id del producto es requerido",
    }),
    delete: z.boolean().optional(),
    status: z.enum(productStatusEnum).optional(),
    barcode: z.string().nullish(),
  });

export const updateProductCommand = createProductCommand.partial().extend({
  id: z.uuid({
    error: "El id del producto es requerido",
  }),
  status: z.enum(productStatusEnum).optional(),
  presentations: z.array(updateProductPresentationCommand).optional(),
});

type CMD = z.infer<typeof updateProductCommand>;

export class UpdateProductCommand {
  constructor(
    private readonly ensureCategoryExistsService: EnsureCategoryExistsService,
    private readonly productUniquenessValidator: ProductUniquenessValidator,
    private readonly productRepository: ProductRepository,
    private readonly productPresentationRepository: ProductPresentationRepository,
  ) {}

  public async execute(activeOrganization: Organization, cmd: CMD) {
    const [existing, errFinding] = await this.productRepository.findOneById(
      activeOrganization.id.toString(),
      cmd.id,
    );

    if (errFinding)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al obtener el producto",
        cause: errFinding.cause,
      });

    if (!existing)
      throw new ORPCError("NOT_FOUND", {
        message: "El producto no existe",
      });

    if (cmd.categoryId && cmd.categoryId !== existing.values.categoryId) {
      const [exists, errEnsure] =
        await this.ensureCategoryExistsService.validate(
          activeOrganization.id.toString(),
          cmd.categoryId,
        );

      if (errEnsure)
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Error al consultar la categoría",
          cause: errEnsure.cause,
        });

      if (!exists)
        throw new ORPCError("BAD_REQUEST", {
          message: "La categoría no existe",
        });
    }

    if (cmd.name && cmd.name !== existing.values.name) {
      const [isTaken, errUnique] =
        await this.productUniquenessValidator.validateUniqueFields(
          activeOrganization.id.toString(),
          {
            name: cmd.name,
            slug: new Slug(cmd.name).toString(),
          },
        );

      if (errUnique)
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Error al validar el producto",
          cause: errUnique.cause,
        });

      if (isTaken.nameTaken || isTaken.slugTaken) {
        throw new ORPCError("BAD_REQUEST", {
          message: "El nombre del producto ya existe",
        });
      }
    }

    existing.update({
      name: cmd.name,
      description: cmd.description,
      status: cmd.status,
      allowNegativeStock: cmd.allowNegativeStock,
      minStock: cmd.minStock,
      stock: cmd.stock,
      categoryId: cmd.categoryId,
    });

    if (!cmd.presentations || cmd.presentations.length === 0) {
      const [, errSaveProduct] =
        await this.productRepository.saveOnlyProduct(existing);

      if (errSaveProduct)
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Error al guardar el producto",
          cause: errSaveProduct.cause,
        });

      return existing.values;
    }

    const presentations: {
      toDelete: string[];
      toUpdate: NonNullable<CMD["presentations"]>;
    } = {
      toDelete: [],
      toUpdate: [],
    };

    cmd.presentations.forEach((item) => {
      if (item.delete) {
        presentations.toDelete.push(item.id);
      } else {
        presentations.toUpdate.push(item);
      }
    });

    presentations.toDelete.forEach((id) => {
      existing.deletePresentation(id);
    });

    const presentationsToUpdate =
      presentations.toUpdate.length > 0
        ? existing.updatePresentations(
            presentations.toUpdate.map(({ id, ...rest }) => ({
              id,
              data: rest,
            })),
          )
        : [];

    const barcodes = presentations.toUpdate
      .map((item) => item.barcode)
      .filter((b) => b !== undefined && b !== null);

    if (barcodes.length > 0) {
      const [isTaken, errValidate] =
        await this.productUniquenessValidator.validateUniqueBarcode(
          activeOrganization.id.toString(),
          barcodes,
          existing.presentations.map((p) => p.id.toString()),
        );

      if (errValidate)
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Error al validar el producto",
          cause: errValidate.cause,
        });

      if (isTaken.barcodesTaken) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Alguno de los barcodes ya está en uso",
        });
      }
    }

    const [, errInsert] = await tryCatch(
      this.productRepository.transaction(async (tx) => {
        const [, errSaveProduct] = await this.productRepository.saveOnlyProduct(
          existing,
          { tx },
        );

        if (errSaveProduct) throw errSaveProduct;

        if (presentationsToUpdate.length > 0) {
          const [, errSavePresentations] =
            await this.productPresentationRepository.save(
              existing.id.toString(),
              presentationsToUpdate,
              { tx },
            );

          if (errSavePresentations) throw errSavePresentations;
        }

        if (presentationsToUpdate.length > 0) {
          const [, errSavePresentations] =
            await this.productPresentationRepository.save(
              existing.id.toString(),
              presentationsToUpdate,
              { tx },
            );

          if (errSavePresentations) throw errSavePresentations;
        }
      }),
    );

    if (errInsert)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al guardar el producto",
        cause: errInsert.cause,
      });

    return existing.values;
  }
}
