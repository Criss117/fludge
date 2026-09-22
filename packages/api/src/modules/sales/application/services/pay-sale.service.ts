import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import type { SaleRepository } from "@fludge/api/modules/sales/domain/repositories/sale.repository";
import { err, ok, type Result } from "@fludge/utils/trycatch";
import type { Sale } from "@fludge/api/modules/sales/domain/entities/sale.entity";
import type { CustomerPayment } from "@fludge/api/modules/customer/domain/entities/customer-payment.entity";
import type { SalePayment } from "@fludge/api/modules/sales/domain/entities/sale-payments.entity";

export type SalePaymentApplication = {
  sale: Sale;
  salePayments: SalePayment;
};

export class PaySaleService {
  constructor(private readonly _saleRepository: SaleRepository) {}

  public async execute(
    activeOrganization: Organization,
    customerId: string,
    customerPayment: CustomerPayment,
  ): Promise<Result<SalePaymentApplication[], Error>> {
    const [sales, errFind] = await this._saleRepository.findByCustomer(
      activeOrganization.id.toString(),
      customerId,
    );

    if (errFind) throw err(errFind);

    if (sales.length === 0) return ok([]);

    const applications: SalePaymentApplication[] = [];

    let remainingAmount = customerPayment.amount;

    for (const sale of sales) {
      if (sale.status.isCompleted()) continue;

      const amountToPay = Math.min(remainingAmount, sale.remaining);

      if (amountToPay <= 0) break;

      const newSalePayment = sale.pay(
        customerPayment.id,
        amountToPay,
        customerPayment.createdBy,
      );

      remainingAmount -= amountToPay;

      applications.push({ sale, salePayments: newSalePayment });
    }

    return ok(applications);
  }
}
