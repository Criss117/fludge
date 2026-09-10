import { createSaleValidator } from "@fludge/utils/validators/sale.validators";
import type { z } from "zod";
import type { SaleRepository } from "@fludge/api/modules/sales/infrastructure/repositories/sale.repository";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { UUID } from "@fludge/utils/uuid";
import type { SaleSequenceRepository } from "@fludge/api/modules/sales/infrastructure/repositories/sale-sequense.repository";
import { Sale } from "@fludge/api/modules/sales/domain/entities/sale.entity";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { ProductRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/product.repository";
import type { SaleProductService } from "@fludge/api/modules/catalog/products/application/services/sale-product.service";

export const createSaleCommand = createSaleValidator;

type CMD = z.infer<typeof createSaleCommand>;

export class CreateSaleCommand {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly saleSequenceRepository: SaleSequenceRepository,
    private readonly productRepository: ProductRepository,
    private readonly saleProductService: SaleProductService,
  ) {}

  public async execute(
    activeOrganization: Organization,
    loggedUserId: string,
    cmd: CMD,
  ) {
    const loggerMember = activeOrganization.members.getMemberByUserId(
      UUID.fromString(loggedUserId),
    )!;

    const items: { presentationId: string; quantity: number }[] = [];

    for (const item of cmd.items) {
      if (item.presentationId === undefined) continue;

      items.push({
        presentationId: item.presentationId,
        quantity: item.quantity,
      });
    }

    const productsToSave = await this.saleProductService.execute(
      activeOrganization,
      items,
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
              id: item.presentationId
                ? UUID.fromString(item.presentationId)
                : null,
              name: item.name,
              price: item.price,
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
