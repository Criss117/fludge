import type { z } from "zod";
import type { EnsureCategoryExistsService } from "@core/catalog/categories/application/services/ensure-category-exists.service";
import { CategoryNotFoundException } from "@core/catalog/categories/domain/exceptions/category-not-found.exception";
import { ProductAlreadyExistsException } from "@core/catalog/products/domain/exceptions/product-already-exists.exception";
import { ProductNotFoundException } from "@core/catalog/products/domain/exceptions/product-not-found.exception";
import { ProductPresentationAlreadyExistsException } from "@core/catalog/products/domain/exceptions/product-presentation-already-exists.exception";
import type { ProductPresentationRepository } from "@core/catalog/products/domain/repositories/product-presentation.repository";
import type { ProductRepository } from "@core/catalog/products/domain/repositories/product.repository";
import type { ProductUniquenessValidator } from "@core/catalog/products/application/services/product-uniqueness-validator.service";
import type { UserAuthContext } from "@core/iam/domain/entities/user-auth-context.entity";
import { InternalServerError } from "@core/shared/exceptions/base-exception";
import { Slug } from "@fludge/utils/slugify";
import { updateProductValidator } from "@fludge/utils/validators/product.validators";

export const updateProductCommand = updateProductValidator;

type CMD = z.infer<typeof updateProductCommand>;

export class UpdateProductCommand {
  constructor(
    private readonly ensureCategoryExistsService: EnsureCategoryExistsService,
    private readonly productUniquenessValidator: ProductUniquenessValidator,
    private readonly productRepository: ProductRepository,
    private readonly productPresentationRepository: ProductPresentationRepository,
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

    // FIX (bug viejo): borrar presentations que ya no vienen en el payload
    const existingPresentationIds = existing.presentations.map((p) =>
      p.id.toString(),
    );
    const incomingPresentationIds = cmd.presentations
      .map((p) => p.id)
      .filter((id): id is string => Boolean(id));

    const presentationsToDelete = existingPresentationIds.filter(
      (id) => !incomingPresentationIds.includes(id),
    );

    existing.deletePresentations(presentationsToDelete);

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

    const [, errSaving] = await this.productRepository.transaction(
      async (tx) => {
        const [, errUpdate] = await this.productRepository.update(existing, {
          tx,
        });

        if (errUpdate) throw errUpdate;

        const [, errSavePresentations] =
          await this.productPresentationRepository.save(
            existing.id.toString(),
            existing.presentations,
            { tx },
          );

        if (errSavePresentations) throw errSavePresentations;

        if (presentationsToDelete.length > 0) {
          const [, errDeletePresentations] =
            await this.productPresentationRepository.deleteMany(
              organizationId,
              existing.id.toString(),
              presentationsToDelete,
              { tx },
            );

          if (errDeletePresentations) throw errDeletePresentations;
        }
      },
    );

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "api_errors.catalog.products.isr_on_save",
      );

    return existing.values;
  }
}