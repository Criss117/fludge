import type { z } from "zod";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import type { EnsureCategoryExistsService } from "@fludge/api/modules/catalog/categories/application/services/ensure-category-exists.service";
import type { ProductUniquenessValidator } from "@fludge/api/modules/catalog/products/application/services/product-uniqueness-validator.service";
import type { ProductRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/product.repository";
import { Slug } from "@fludge/utils/slugify";
import { updateProductValidator } from "@fludge/utils/validators/product.validators";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { ProductNotFoundException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-not-found.exception";
import { CategoryNotFoundException } from "@fludge/api/modules/catalog/categories/domain/exceptions/category-not-found.exception";
import { ProductAlreadyExistsException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-already-exists.exception";
import { ProductPresentationAlreadyExistsException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-presentation-already-exists.exception";
import { UUID } from "@fludge/utils/uuid";
import type { Product } from "@fludge/api/modules/catalog/products/domain/entities/product.entity";

export const updateProductCommand = updateProductValidator;

type CMD = z.infer<typeof updateProductCommand>;

export class UpdateProductCommand {
  constructor(
    private readonly ensureCategoryExistsService: EnsureCategoryExistsService,
    private readonly productUniquenessValidator: ProductUniquenessValidator,
    private readonly productRepository: ProductRepository,
  ) {}

  private async findProduct(activeOrganizationId: string, productId: string) {
    const [existing, errFinding] = await this.productRepository.findOneById(
      activeOrganizationId,
      productId,
    );

    if (errFinding)
      throw new InternalServerError(
        errFinding,
        "api_errors.catalog.products.isr_on_find",
      );

    if (!existing) throw new ProductNotFoundException();

    return existing;
  }

  private async checkExternals(
    activeOrganizationId: string,
    existing: Product,
    cmd: CMD,
  ) {
    // if categoryId is not empty and it is different from the existing one
    // then we need to ensure that the category exists
    if (cmd.categoryId && cmd.categoryId !== existing.values.categoryId) {
      const [exists, errEnsure] =
        await this.ensureCategoryExistsService.validate(
          activeOrganizationId,
          cmd.categoryId,
        );

      if (errEnsure)
        throw new InternalServerError(
          errEnsure,
          "api_errors.catalog.categories.isr_on_find",
        );

      if (!exists) throw new CategoryNotFoundException();
    }

    // if name is not empty and it is different from the existing one
    // then we need to ensure that the name is unique
    if (cmd.name && cmd.name !== existing.values.name) {
      const [isTaken, errUnique] =
        await this.productUniquenessValidator.validateUniqueFields(
          activeOrganizationId,
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
    }
  }

  public async execute(
    loggedUserId: string,
    activeOrganization: Organization,
    cmd: CMD,
  ) {
    const loggedMember = activeOrganization.members.getMemberByUserId(
      UUID.fromString(loggedUserId),
    )!;

    const activeOrganizationId = activeOrganization.id.toString();

    const existing = await this.findProduct(activeOrganizationId, cmd.id);

    await this.checkExternals(activeOrganizationId, existing, cmd);

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
        createdBy: loggedMember.id.toString(),
      })),
    );

    const barcodes = existing.barcodes;

    const [barcodeIsTaken, errValidate] =
      await this.productUniquenessValidator.validateUniqueBarcode(
        activeOrganization.id.toString(),
        barcodes,
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
