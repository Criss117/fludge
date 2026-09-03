import { z } from "zod";
import { Product } from "@fludge/api/modules/catalog/products/domain/entities/product.entity";
import { UUID } from "@fludge/utils/uuid";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import type { EnsureCategoryExistsService } from "@fludge/api/modules/catalog/categories/application/services/ensure-category-exists.service";
import type { ProductUniquenessValidator } from "../services/product-uniqueness-validator.service";
import type { ProductRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/product.repository";
import { Slug } from "@fludge/utils/slugify";
import { createProductValidator } from "@fludge/utils/validators/product.validators";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { CategoryNotFoundException } from "@fludge/api/modules/catalog/categories/domain/exceptions/category-not-found.exception";
import { ProductAlreadyExistsException } from "../../domain/exceptions/product-already-exists.exception";
import { ProductPresentationAlreadyExistsException } from "../../domain/exceptions/product-presentation-already-exists.exception";

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
        throw new InternalServerError(
          errEnsure,
          "api_errors.catalog.categories.isr_on_find",
        );

      if (!exists) throw new CategoryNotFoundException();
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
        activeOrganization.id.toString(),
        cmd.presentations
          .map((item) => item.barcode)
          .filter((b) => b !== undefined),
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

    if (errInsert)
      throw new InternalServerError(
        errInsert,
        "api_errors.catalog.products.isr_on_save",
      );

    return product.values;
  }
}
