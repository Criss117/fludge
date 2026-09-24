import type { z } from "zod";
import type { SaleRepository } from "../../../../commerce/sale/domain/repositories/sale.repository";
import type { SalePaymentRepository } from "../../../../commerce/sale/domain/repositories/sale-payment.repository";
import type { CustomerRepository } from "../../../../commerce/customer/domain/repositories/customer.repository";
import type { ProductRepository } from "@fludge/api/core/catalog/products/domain/repositories/product.repository";
import type { DecreaseCustomerBalanceService } from "../../../../commerce/customer/application/services/decrease-customer-balance.service";
import type {
  RefundProductsService,
  RefundProductInput,
} from "../../../../commerce/sale/application/services/refund-products.service";
import { SaleNotFoundException } from "../../../../commerce/sale/domain/exceptions/sale-not-found.exception";
import type { UserAuthContext } from "@fludge/api/core/iam/domain/entities/user-auth-context.entity";
import { InternalServerError } from "@fludge/api/core/shared/exceptions/base-exception";
import { cancelSaleValidator } from "@fludge/utils/validators/sale.validators";

export const cancelSaleCommand = cancelSaleValidator;

type CMD = z.infer<typeof cancelSaleCommand>;

export class CancelSaleCommand {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly salePaymentRepository: SalePaymentRepository,
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

    // 2. Preparar datos de reembolso de productos desde el snapshot de cada item
    const refundInputs: RefundProductInput[] = [];

    for (const item of sale.values.items) {
      if (!item.productSnapshot || !item.productId) continue;

      const existing = refundInputs.find((r) => r.productId === item.productId);

      const presentationInput = {
        presentationId: item.productSnapshot.presentation.id,
        quantity: item.quantity,
        conversionFactor: item.productSnapshot.presentation.conversionFactor,
      };

      if (existing) {
        existing.presentations.push(presentationInput);
      } else {
        refundInputs.push({
          productId: item.productId,
          presentations: [presentationInput],
        });
      }
    }

    // 3. Revertir stock de productos (si existen)
    const productsToSave = await this.refundProductsService.execute(
      organizationId,
      refundInputs,
    );

    // 4. Disminuir balance del customer (si la venta tenía cliente)
    let customer = null;

    if (sale.values.customerId) {
      customer = await this.decreaseCustomerBalanceService.execute(
        organizationId,
        sale.values.customerId,
        sale.values.total - sale.values.totalPaid,
      );
    }

    // 5. Cancelar la venta (limpia payments, marca items inactivos)
    sale.cancel(cmd.cancellationReason);

    // 6. Persistir todo en una transacción (mínimas llamadas a DB)
    const [, errTransaction] = await this.saleRepository.transaction(
      async (tx) => {
        // Eliminar todos los SalePayments de la venta
        const [, errDeletePayments] =
          await this.salePaymentRepository.deleteBySaleId(cmd.id, { tx });

        if (errDeletePayments) throw errDeletePayments;

        // Actualizar la venta
        const [, errSale] = await this.saleRepository.update(sale, { tx });

        if (errSale) throw errSale;

        // Actualizar customer si aplica
        if (customer) {
          const [, errCustomer] = await this.customerRepository.update(
            customer,
            { tx },
          );

          if (errCustomer) throw errCustomer;
        }

        // Actualizar productos si hay stock que revertir
        if (productsToSave.length > 0) {
          const [, errProducts] = await this.productRepository.saveOnlyProducts(
            productsToSave,
            {
              tx,
            },
          );

          if (errProducts) throw errProducts;
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
      customer: customer?.values ?? null,
      products: productsToSave.map((p) => p.values),
    };
  }
}
