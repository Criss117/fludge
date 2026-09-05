import type { z } from "zod";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import type { EnsureCategoryExistsService } from "@fludge/api/modules/catalog/categories/application/services/ensure-category-exists.service";
import type { ProductUniquenessValidator } from "@fludge/api/modules/catalog/products/application/services/product-uniqueness-validator.service";
import type { ProductRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/product.repository";
import type { ProductPresentationRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/product-presentation.repository";
import { Slug } from "@fludge/utils/slugify";
import { tryCatch } from "@fludge/utils/trycatch";
import { updateProductValidator } from "@fludge/utils/validators/product.validators";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { ProductNotFoundException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-not-found.exception";
import { CategoryNotFoundException } from "@fludge/api/modules/catalog/categories/domain/exceptions/category-not-found.exception";
import { ProductAlreadyExistsException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-already-exists.exception";
import { ProductPresentationAlreadyExistsException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-presentation-already-exists.exception";
import { UUID } from "@fludge/utils/uuid";

export const updateProductCommand = updateProductValidator;

type CMD = z.infer<typeof updateProductCommand>;

export class UpdateProductCommand {
  constructor(
    private readonly ensureCategoryExistsService: EnsureCategoryExistsService,
    private readonly productUniquenessValidator: ProductUniquenessValidator,
    private readonly productRepository: ProductRepository,
    private readonly productPresentationRepository: ProductPresentationRepository,
  ) {}

  public async execute(
    loggedUserId: string,
    activeOrganization: Organization,
    cmd: CMD,
  ) {
    const loggedMember = activeOrganization.members.getMemberByUserId(
      UUID.fromString(loggedUserId),
    )!;

    const [existing, errFinding] = await this.productRepository.findOneById(
      activeOrganization.id.toString(),
      cmd.id,
    );

    if (errFinding)
      throw new InternalServerError(
        errFinding,
        "api_errors.catalog.products.isr_on_find",
      );

    if (!existing) throw new ProductNotFoundException();

    // if categoryId is not empty and it is different from the existing one
    // then we need to ensure that the category exists
    if (cmd.categoryId && cmd.categoryId !== existing.values.categoryId) {
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

    // if name is not empty and it is different from the existing one
    // then we need to ensure that the name is unique
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

    const presentations: {
      toDelete: string[];
      toUpdate: CMD["presentations"];
      toCreate: CMD["presentations"];
    } = {
      toDelete: [],
      toUpdate: [],
      toCreate: [],
    };

    for (const item of cmd.presentations) {
      if (item.id && item.delete) presentations.toDelete.push(item.id);

      if (item.id) {
        presentations.toUpdate.push(item);
      } else {
        presentations.toCreate.push(item);
      }
    }

    existing.deletePresentations(presentations.toDelete);

    const presentationsToUpdate =
      presentations.toUpdate.length > 0
        ? existing.updatePresentations(
            presentations.toUpdate.map(({ id, ...rest }) => ({
              id: id!,
              data: rest,
            })),
          )
        : [];

    const presentationsToCreate =
      presentations.toCreate.length > 0
        ? existing.addPresentations(
            presentations.toCreate.map((item) => ({
              barcode: item.barcode,
              conversionFactor: item.conversionFactor,
              name: item.name,
              productName: cmd.name,
              pricePurchase: item.pricePurchase,
              priceSale: item.priceSale,
              priceWholesale: item.priceWholesale,
              organizationId: activeOrganization.id.toString(),
              createdBy: loggedMember.id.toString(),
            })),
          )
        : [];

    const presentationsToSave = [
      ...presentationsToCreate,
      ...presentationsToUpdate,
    ];

    const barcodes = presentationsToSave
      .map((item) => item.barcode)
      .filter((b) => b !== undefined && b !== null);

    if (barcodes.length > 0) {
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
    }

    const [, errInsert] = await tryCatch(
      this.productRepository.transaction(async (tx) => {
        const [, errSaveProduct] = await this.productRepository.saveOnlyProduct(
          existing,
          { tx },
        );

        if (errSaveProduct) throw errSaveProduct;

        if (presentationsToSave.length > 0) {
          const [, errSavePresentations] =
            await this.productPresentationRepository.save(
              existing.id.toString(),
              presentationsToUpdate,
              { tx },
            );

          if (errSavePresentations) throw errSavePresentations;
        }

        if (presentations.toDelete.length > 0) {
          const [, errSavePresentations] =
            await this.productPresentationRepository.deleteMany(
              activeOrganization.id.toString(),
              existing.id.toString(),
              presentations.toDelete,
              { tx },
            );

          if (errSavePresentations) throw errSavePresentations;
        }
      }),
    );

    if (errInsert)
      throw new InternalServerError(
        errInsert,
        "api_errors.catalog.products.isr_on_save",
      );

    return existing.values;
  }
}
