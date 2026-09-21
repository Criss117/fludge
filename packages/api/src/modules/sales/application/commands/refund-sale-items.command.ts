import { refundSaleItemsValidator } from "@fludge/utils/validators/sale.validators";
import type { z } from "zod";
import type { SaleRepository } from "@fludge/api/modules/sales/infrastructure/repositories/sale.repository";
import type { ProductRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/product.repository";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { SaleNotFoundException } from "@fludge/api/modules/sales/domain/exceptions/sale-not-found.exception";
import { ProductNotFoundException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-not-found.exception";
import type { Product } from "@fludge/api/modules/catalog/products/domain/entities/product.entity";

export const refundSaleItemsCommand = refundSaleItemsValidator;

type CMD = z.infer<typeof refundSaleItemsCommand>;

export class RefundSaleItemsCommand {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  public async execute(activeOrganization: Organization, cmd: CMD) {
    const [existingSale, errFindSale] = await this.saleRepository.findById(
      activeOrganization.id.toString(),
      cmd.id,
    );

    if (errFindSale)
      throw new InternalServerError(
        errFindSale,
        "api_errors.sales.isr_on_find",
      );

    if (!existingSale) throw new SaleNotFoundException();
    const itemsToRefund = existingSale.refundItems(cmd.itemIds);

    const productIds = existingSale.items.getProductIdsByItemIds(cmd.itemIds);

    const productsToSave: Product[] = [];

    if (productIds.length > 0) {
      const [products, errFindProducts] =
        await this.productRepository.findManyByIds(
          activeOrganization.id.toString(),
          productIds,
        );

      if (errFindProducts)
        throw new InternalServerError(
          errFindProducts,
          "api_errors.catalog.products.isr_on_find",
        );

      if (products.length !== productIds.length)
        throw new ProductNotFoundException();

      for (const item of itemsToRefund) {
        const values = item.values;

        const productSnapshot = values.productSnapshot;

        if (!productSnapshot) continue;

        const product = products.find(
          (p) => p.id.toString() === productSnapshot.product.id,
        );

        if (!product) continue;

        product.refund({
          presentationId: productSnapshot.presentation.id,
          conversionFactor: productSnapshot.presentation.conversionFactor,
          quantity: values.quantity,
        });
      }

      productsToSave.push(...products);
    }

    await this.saleRepository.transaction(async (tx) => {
      await this.saleRepository.save(existingSale, { tx });

      if (productsToSave.length > 0) {
        const [, errToSaveProducts] =
          await this.productRepository.saveOnlyProducts(productsToSave, {
            tx,
          });

        if (errToSaveProducts) throw errToSaveProducts;
      }
    });

    return {
      sale: existingSale.values,
      products: productsToSave.map((p) => p.values),
    };
  }
}
