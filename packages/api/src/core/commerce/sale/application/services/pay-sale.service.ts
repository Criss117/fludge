import type { Sale } from "../../../../commerce/sale/domain/entities/sale.entity";
import type { SalePayment } from "../../../../commerce/sale/domain/entities/sale-payment.entity";
import type { SaleRepository } from "../../../../commerce/sale/domain/repositories/sale.repository";
import { InternalServerError } from "@fludge/api/core/shared/exceptions/base-exception";
import { UUID } from "@fludge/utils/uuid";

export interface PaySaleResult {
  sale: Sale;
  salePayments: SalePayment[];
}

/**
 * Distribuye un pago de customer entre las ventas abiertas/parciales
 * del cliente, de la más antigua a la más nueva.
 */
export class PaySaleService {
  constructor(private readonly saleRepository: SaleRepository) {}

  public async execute(
    organizationId: string,
    customerId: string,
    customerPaymentId: UUID,
    totalAmount: number,
    createdBy: UUID,
  ): Promise<PaySaleResult[]> {
    const [sales, errFind] = await this.saleRepository.findOpenByCustomer(
      organizationId,
      customerId,
    );

    if (errFind)
      throw new InternalServerError(errFind, "api_errors.sales.isr_on_find");

    const results: PaySaleResult[] = [];
    let remaining = totalAmount;

    for (const sale of sales) {
      if (remaining <= 0) break;

      const saleRemaining = sale.remaining;
      const amountToPay = Math.min(remaining, saleRemaining);

      if (amountToPay <= 0) continue;

      const salePayment = sale.pay(customerPaymentId, amountToPay, createdBy);

      results.push({ sale, salePayments: [salePayment] });
      remaining -= amountToPay;
    }

    return results;
  }
}
