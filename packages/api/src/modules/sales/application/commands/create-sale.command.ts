import { createSaleValidator } from "@fludge/utils/validators/sale.validators";
import type { z } from "zod";
import type { SaleRepository } from "@fludge/api/modules/sales/infrastructure/repositories/sale.repository";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { UUID } from "@fludge/utils/uuid";
import type { SaleSequenceRepository } from "@fludge/api/modules/sales/infrastructure/repositories/sale-sequense.repository";
import { Sale } from "@fludge/api/modules/sales/domain/entities/sale.entity";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { EnsurePresentationsExistsService } from "@fludge/api/modules/catalog/products/application/services/ensure-presentations-exists.service";
import { ProductPresentationNotFoundException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-presentation-not-found.exception";
import type { Product } from "@fludge/api/modules/catalog/products/domain/entities/product.entity";
import type { ProductRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/product.repository";
import { ProductNotFoundException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-not-found.exception";

export const createSaleCommand = createSaleValidator;

type CMD = z.infer<typeof createSaleCommand>;

export class CreateSaleCommand {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly saleSequenceRepository: SaleSequenceRepository,
    private readonly ensurePresentationsExistsService: EnsurePresentationsExistsService,
    private readonly productRepository: ProductRepository,
  ) {}

  private async checkProducts(
    activeOrganization: Organization,
    items: CMD["items"],
  ) {
    const productsToSave: Product[] = [];

    const presentationsIds = items
      .filter((item) => item.presentation.id !== undefined)
      .map((item) => ({
        id: item.presentation.id!,
        quantity: item.quantity,
      }));

    if (presentationsIds.length === 0) return productsToSave;

    const [exists, errExists] =
      await this.ensurePresentationsExistsService.execute(
        activeOrganization.id.toString(),
        presentationsIds.map((p) => p.id),
      );

    if (errExists)
      throw new InternalServerError(
        errExists,
        "api_errors.catalog.products_presentations.isr_on_find",
      );

    if (exists.size === 0) throw new ProductPresentationNotFoundException();

    const productsIds = Array.from(exists.keys());

    const [productsFind, errFinding] =
      await this.productRepository.findManyByIds(
        activeOrganization.id.toString(),
        productsIds,
      );

    if (errFinding)
      throw new InternalServerError(
        errFinding,
        "api_errors.catalog.products.isr_on_find",
      );

    if (productsFind.length !== productsIds.length)
      throw new ProductNotFoundException();

    for (const [productId, presentationIds] of exists) {
      const presentations = presentationsIds.filter((p) =>
        presentationIds.includes(p.id),
      );

      const product = productsFind.find((p) =>
        p.id.equals(UUID.fromString(productId)),
      )!;

      product.sale(presentations);

      productsToSave.push(product);
    }

    return productsToSave;
  }

  public async execute(
    activeOrganization: Organization,
    loggedUserId: string,
    cmd: CMD,
  ) {
    const loggerMember = activeOrganization.members.getMemberByUserId(
      UUID.fromString(loggedUserId),
    )!;

    const productsToSave = await this.checkProducts(
      activeOrganization,
      cmd.items,
    );

    const [newSale, errTransaction] = await this.saleRepository.transaction(
      async (tx) => {
        const [nextSecuence, errNextSequence] =
          await this.saleSequenceRepository.getNextSequence(
            activeOrganization.id.toString(),
            { tx },
          );

        if (errNextSequence) throw errNextSequence;

        const sale = Sale.create({
          createdBy: loggerMember.id,
          organizationId: activeOrganization.id,
          customerId: cmd.customerId ? UUID.fromString(cmd.customerId) : null,
          paymentType: cmd.paymentType,
          notes: cmd.notes,
          sequence: nextSecuence,
          items: cmd.items.map((item) => ({
            organizationId: activeOrganization.id,
            productPresentation: {
              id: item.presentation.id
                ? UUID.fromString(item.presentation.id)
                : null,
              name: item.presentation.name,
              price: item.presentation.price,
            },
            quantity: item.quantity,
          })),
        });

        const [, errSavingSale] = await this.saleRepository.save(sale, { tx });

        if (errSavingSale) throw errSavingSale;

        if (productsToSave.length > 0) {
          const [, errToSaveProducts] =
            await this.productRepository.saveOnlyProducts(productsToSave, {
              tx,
            });

          if (errToSaveProducts) throw errToSaveProducts;
        }

        return sale;
      },
    );

    if (errTransaction)
      throw new InternalServerError(
        errTransaction,
        "api_errors.sales.isr_on_save",
      );

    return {
      sale: newSale,
      products: productsToSave,
    };
  }
}
