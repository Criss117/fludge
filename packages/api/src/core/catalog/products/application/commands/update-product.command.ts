import type { z } from "zod";
import type { EnsureCategoryExistsService } from "@fludge/api/core/catalog/categories/application/services/ensure-category-exists.service";
import { CategoryNotFoundException } from "@fludge/api/core/catalog/categories/domain/exceptions/category-not-found.exception";
import { ProductAlreadyExistsException } from "@fludge/api/core/catalog/products/domain/exceptions/product-already-exists.exception";
import { ProductNotFoundException } from "@fludge/api/core/catalog/products/domain/exceptions/product-not-found.exception";
import { ProductPresentationAlreadyExistsException } from "@fludge/api/core/catalog/products/domain/exceptions/product-presentation-already-exists.exception";
import type { ProductRepository } from "@fludge/api/core/catalog/products/domain/repositories/product.repository";
import type { ProductUniquenessValidator } from "@fludge/api/core/catalog/products/application/services/product-uniqueness-validator.service";
import type { UserAuthContext } from "@fludge/api/core/iam/domain/entities/user-auth-context.entity";
import { InternalServerError } from "@fludge/api/core/shared/exceptions/base-exception";
import { Slug } from "@fludge/utils/slugify";
import { updateProductValidator } from "@fludge/utils/validators/product.validators";

export const updateProductCommand = updateProductValidator;

type CMD = z.infer<typeof updateProductCommand>;

export class UpdateProductCommand {
  constructor(
    private readonly ensureCategoryExistsService: EnsureCategoryExistsService,
    private readonly productUniquenessValidator: ProductUniquenessValidator,
    private readonly productRepository: ProductRepository,
  ) {}

  public async execute(authContext: UserAuthContext, cmd: CMD) {
    const organizationId = authContext.organizationId.toString();

    const [existing, errFinding] = await this.productRepository.findById(
      organizationId,
      cmd.id,
    );

    if (errFinding)
      throw new InternalServerError(
        errFinding,
        "api_errors.catalog.products.isr_on_find",
      );

    if (!existing) throw new ProductNotFoundException();

    if (cmd.categoryId && cmd.categoryId !== existing.values.categoryId) {
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

    if (cmd.name && cmd.name !== existing.values.name) {
      const [isTaken, errUnique] =
        await this.productUniquenessValidator.validateUniqueFields(
          organizationId,
          {
            name: cmd.name,
            slug: new Slug(cmd.name).toString(),
          },
          existing.id.toString(),
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

    existing.savePresentations(
      cmd.presentations.map((p) => ({
        conversionFactor: p.conversionFactor,
        name: p.name,
        productName: existing.values.name,
        pricePurchase: p.pricePurchase,
        priceSale: p.priceSale,
        priceWholesale: p.priceWholesale,
        status: p.status,
        barcode: p.barcode,
        id: p.id,
        createdBy: authContext.member.id.toString(),
      })),
    );

    const [barcodeIsTaken, errValidate] =
      await this.productUniquenessValidator.validateUniqueBarcode(
        organizationId,
        existing.barcodes,
        existing.presentations.map((p) => p.id.toString()),
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

    const [, errInsert] = await this.productRepository.save(existing);

    if (errInsert)
      throw new InternalServerError(
        errInsert,
        "api_errors.catalog.products.isr_on_save",
      );

    return existing.values;
  }
}
