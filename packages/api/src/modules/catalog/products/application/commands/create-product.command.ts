import { z } from "zod";
import { Product } from "@fludge/api/modules/catalog/products/domain/entities/product.entity";
import { UUID } from "@fludge/utils/uuid";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import type { EnsureCategoryExistsService } from "@fludge/api/modules/catalog/categories/application/services/ensure-category-exists.service";
import { ORPCError } from "@orpc/server";
import type { ProductUniquenessValidator } from "../services/product-uniqueness-validator.service";
import type { ProductRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/product.repository";
import { Slug } from "@fludge/utils/slugify";
import { createProductValidator } from "@fludge/utils/validators/product.validators";

export const createProductCommand = createProductValidator;

type CMD = z.infer<typeof createProductCommand>;

export class CreateProductCommand {
  constructor(
    private readonly ensureCategoryExistsService: EnsureCategoryExistsService,
    private readonly productUniquenessValidator: ProductUniquenessValidator,
    private readonly productRepository: ProductRepository,
  ) {}

  public async execute(
    loggedUserId: string,
    activeOrganization: Organization,
    cmd: CMD,
  ) {
    const loggedMember = activeOrganization.members.getMemberByUserId(
      UUID.fromString(loggedUserId),
    )!;

    const product = Product.create({
      allowNegativeStock: cmd.allowNegativeStock,
      categoryId: cmd.categoryId ?? null,
      description: cmd.description ?? null,
      minStock: cmd.minStock,
      name: cmd.name,
      organizationId: activeOrganization.id.toString(),
      createdBy: loggedMember.id.toString(),
      stock: cmd.stock,
      presentations: cmd.presentations.map((item) => ({
        barcode: item.barcode ?? null,
        conversionFactor: item.conversionFactor,
        name: item.name,
        productName: cmd.name,
        pricePurchase: item.pricePurchase ?? null,
        priceSale: item.priceSale,
        priceWholesale: item.priceWholesale ?? null,
        organizationId: activeOrganization.id.toString(),
        createdBy: loggedMember.id.toString(),
      })),
    });

    if (cmd.categoryId) {
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

    const [barcodeIsTaken, errValidate] =
      await this.productUniquenessValidator.validateUniqueBarcode(
        activeOrganization.id.toString(),
        cmd.presentations
          .map((item) => item.barcode)
          .filter((b) => b !== undefined),
      );

    if (errValidate)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al validar el producto",
        cause: errValidate.cause,
      });

    if (barcodeIsTaken.barcodesTaken) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Alguno de los barcodes ya está en uso",
      });
    }

    const [, errInsert] = await this.productRepository.save(product);

    if (errInsert)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Error al guardar el producto",
        cause: errInsert.cause,
      });

    return product.values;
  }
}
