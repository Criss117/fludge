import type { z } from "zod";
import type { SaleRepository } from "../../../../commerce/sale/domain/repositories/sale.repository";
import type { CustomerRepository } from "../../../../commerce/customer/domain/repositories/customer.repository";
import type { ProductRepository } from "../../../../catalog/products/domain/repositories/product.repository";
import type { DecreaseCustomerBalanceService } from "../../../../commerce/customer/application/services/decrease-customer-balance.service";
import type { RefundProductsService, RefundProductInput } from "../../../../commerce/sale/application/services/refund-products.service";
import { SaleNotFoundException } from "../../../../commerce/sale/domain/exceptions/sale-not-found.exception";
import type { UserAuthContext } from "../../../../iam/domain/entities/user-auth-context.entity";
import { InternalServerError } from "../../../../shared/exceptions/base-exception";
import { refundSaleItemsValidator } from "@fludge/utils/validators/sale.validators";

export const refundSaleItemsCommand = refundSaleItemsValidator;

type CMD = z.infer<typeof refundSaleItemsCommand>;

export class RefundSaleItemsCommand {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly productRepository: ProductRepository,
    private readonly decreaseCustomerBalanceService: DecreaseCustomerBalanceService,
    private readonly refundProductsService: RefundProductsService,
  ) {}

  public async execute(authContext: UserAuthContext, cmd: CMD) {
    const organizationId = authContext.organizationId.toString();

    // 1. Buscar la venta
    const [sale, errFindSale] = await this.saleRepository.findById(
      organizationId,
      cmd.id,
    );

    if (errFindSale)
      throw new InternalServerError(
        errFindSale,
        "api_errors.sales.isr_on_find",
      );

    if (!sale) throw new SaleNotFoundException();

    // 2. Marcar items como inactivos y recalcular total
    const refundedItems = sale.refundItems(cmd.itemIds);

    // 3. Preparar datos de reembolso de productos desde el snapshot
    const refundInputs: RefundProductInput[] = [];

    for (const item of refundedItems) {
      const snapshot = item.values.productSnapshot;
      if (!snapshot || !item.values.productId) continue;

      const existing = refundInputs.find(
        (r) => r.productId === item.values.productId,
      );

      const presentationInput = {
        presentationId: snapshot.presentation.id,
        quantity: item.values.quantity,
        conversionFactor: snapshot.presentation.conversionFactor,
      };

      if (existing) {
        existing.presentations.push(presentationInput);
      } else {
        refundInputs.push({
          productId: item.values.productId,
          presentations: [presentationInput],
        });
      }
    }

    // 4. Revertir stock de productos (si existen)
    const productsToSave = await this.refundProductsService.execute(
      organizationId,
      refundInputs,
    );

    // 5. Disminuir balance del customer si la venta tiene cliente
    let customer = null;

    if (sale.values.customerId) {
      const totalRefunded = refundedItems.reduce(
        (acc, item) => acc + item.values.subtotal,
        0,
      );

      customer = await this.decreaseCustomerBalanceService.execute(
        organizationId,
        sale.values.customerId,
        totalRefunded,
      );
    }

    // 6. Persistir todo en una transacción (mínimas llamadas a DB)
    const [, errTransaction] = await this.saleRepository.transaction(
      async (tx) => {
        const [, errSale] = await this.saleRepository.update(sale, { tx });

        if (errSale) throw errSale;

        if (productsToSave.length > 0) {
          const [, errProducts] =
            await this.productRepository.saveOnlyProducts(productsToSave, {
              tx,
            });

          if (errProducts) throw errProducts;
        }

        if (customer) {
          const [, errCustomer] = await this.customerRepository.update(
            customer,
            { tx },
          );

          if (errCustomer) throw errCustomer;
        }
      },
    );

    if (errTransaction)
      throw new InternalServerError(
        errTransaction,
        "api_errors.sales.isr_on_save",
      );

    return {
      sale: sale.values,
      products: productsToSave.map((p) => p.values),
      customer: customer?.values ?? null,
    };
  }
}
