import type { z } from "zod";
import type { EnsureCategoryExistsService } from "@fludge/api/core/catalog/categories/application/services/ensure-category-exists.service";
import { Product } from "@fludge/api/core/catalog/products/domain/entities/product.entity";
import { CategoryNotFoundException } from "@fludge/api/core/catalog/categories/domain/exceptions/category-not-found.exception";
import { ProductAlreadyExistsException } from "@fludge/api/core/catalog/products/domain/exceptions/product-already-exists.exception";
import { ProductPresentationAlreadyExistsException } from "@fludge/api/core/catalog/products/domain/exceptions/product-presentation-already-exists.exception";
import type { ProductRepository } from "@fludge/api/core/catalog/products/domain/repositories/product.repository";
import type { ProductUniquenessValidator } from "@fludge/api/core/catalog/products/application/services/product-uniqueness-validator.service";
import type { UserAuthContext } from "@fludge/api/core/iam/domain/entities/user-auth-context.entity";
import { InternalServerError } from "@fludge/api/core/shared/exceptions/base-exception";
import { Slug } from "@fludge/utils/slugify";
import { createProductValidator } from "@fludge/utils/validators/product.validators";
import { UUID } from "@fludge/utils/uuid";

export const createProductCommand = createProductValidator;

type CMD = z.infer<typeof createProductCommand>;

export class CreateProductCommand {
  constructor(
    private readonly ensureCategoryExistsService: EnsureCategoryExistsService,
    private readonly productUniquenessValidator: ProductUniquenessValidator,
    private readonly productRepository: ProductRepository,
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
      categoryId: cmd.categoryId ? UUID.fromString(cmd.categoryId) : null,
      description: cmd.description ?? "",
      minStock: cmd.minStock,
      name: cmd.name,
      organizationId: authContext.organizationId,
      createdBy: authContext.member.id,
      stock: cmd.stock,
      presentations: cmd.presentations.map((item) => ({
        barcode: item.barcode,
        conversionFactor: item.conversionFactor,
        name: item.name,
        productName: cmd.name,
        pricePurchase: item.pricePurchase,
        priceSale: item.priceSale,
        priceWholesale: item.priceWholesale,
        createdBy: authContext.member.id,
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

    const [, errInsert] = await this.productRepository.save(product);

    if (errInsert) throw errInsert;

    if (errInsert)
      throw new InternalServerError(
        errInsert,
        "api_errors.catalog.products.isr_on_save",
      );

    return product.values;
  }
}
