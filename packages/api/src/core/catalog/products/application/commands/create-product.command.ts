import type { z } from "zod";
import type { EnsureCategoryExistsService } from "../../../../catalog/categories/application/services/ensure-category-exists.service";
import { Product } from "../../../../catalog/products/domain/entities/product.entity";
import { CategoryNotFoundException } from "../../../../catalog/categories/domain/exceptions/category-not-found.exception";
import { ProductAlreadyExistsException } from "../../../../catalog/products/domain/exceptions/product-already-exists.exception";
import { ProductPresentationAlreadyExistsException } from "../../../../catalog/products/domain/exceptions/product-presentation-already-exists.exception";
import type { ProductPresentationRepository } from "../../../../catalog/products/domain/repositories/product-presentation.repository";
import type { ProductRepository } from "../../../../catalog/products/domain/repositories/product.repository";
import type { ProductUniquenessValidator } from "../../../../catalog/products/application/services/product-uniqueness-validator.service";
import type { UserAuthContext } from "../../../../iam/domain/entities/user-auth-context.entity";
import { InternalServerError } from "../../../../shared/exceptions/base-exception";
import { Slug } from "@fludge/utils/slugify";
import { createProductValidator } from "@fludge/utils/validators/product.validators";

export const createProductCommand = createProductValidator;

type CMD = z.infer<typeof createProductCommand>;

export class CreateProductCommand {
  constructor(
    private readonly ensureCategoryExistsService: EnsureCategoryExistsService,
    private readonly productUniquenessValidator: ProductUniquenessValidator,
    private readonly productRepository: ProductRepository,
    private readonly productPresentationRepository: ProductPresentationRepository,
  ) {}

  public async execute(authContext: UserAuthContext, cmd: CMD) {
    const organizationId = authContext.organizationId.toString();

    if (cmd.categoryId) {
      const [exists, errEnsure] =
        await this.ensureCategoryExistsService.validate(
          organizationId,
          cmd.categoryId,
        );

      if (errEnsure)
        throw new InternalServerError(
          errEnsure,
          "api_errors.catalog.categories.isr_on_find",
        );

      if (!exists) throw new CategoryNotFoundException();
    }

    const product = Product.create({
      allowNegativeStock: cmd.allowNegativeStock,
      categoryId: cmd.categoryId,
      description: cmd.description ?? "",
      minStock: cmd.minStock,
      name: cmd.name,
      organizationId,
      createdBy: authContext.member.id.toString(),
      stock: cmd.stock,
      presentations: cmd.presentations.map((item) => ({
        barcode: item.barcode,
        conversionFactor: item.conversionFactor,
        name: item.name,
        productName: cmd.name,
        pricePurchase: item.pricePurchase,
        priceSale: item.priceSale,
        priceWholesale: item.priceWholesale,
        organizationId,
        createdBy: authContext.member.id.toString(),
      })),
    });

    const [isTaken, errUnique] =
      await this.productUniquenessValidator.validateUniqueFields(
        organizationId,
        {
          name: cmd.name,
          slug: new Slug(cmd.name).toString(),
        },
      );

    if (errUnique)
      throw new InternalServerError(
        errUnique,
        "api_errors.catalog.products.isr_on_find",
      );

    if (isTaken.nameTaken || isTaken.slugTaken) {
      throw new ProductAlreadyExistsException(
        "api_errors.catalog.products.name_taken",
      );
    }

    const [barcodeIsTaken, errValidate] =
      await this.productUniquenessValidator.validateUniqueBarcode(
        organizationId,
        product.barcodes,
      );

    if (errValidate)
      throw new InternalServerError(
        errValidate,
        "api_errors.catalog.products_presentations.isr_on_find",
      );

    if (barcodeIsTaken.barcodesTaken) {
      throw new ProductPresentationAlreadyExistsException(
        "api_errors.catalog.products_presentations.barcodes_taken",
      );
    }

    const [, errSaving] = await this.productRepository.transaction(
      async (tx) => {
        const [, errInsert] = await this.productRepository.insert(product, {
          tx,
        });

        if (errInsert) throw errInsert;

        const [, errSavePresentations] =
          await this.productPresentationRepository.save(
            product.id.toString(),
            product.presentations,
            { tx },
          );

        if (errSavePresentations) throw errSavePresentations;
      },
    );

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "api_errors.catalog.products.isr_on_save",
      );

    return product.values;
  }
}