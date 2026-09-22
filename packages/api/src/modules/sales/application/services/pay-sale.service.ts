import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import type { SaleRepository } from "@fludge/api/modules/sales/domain/repositories/sale.repository";
import { err, ok, type Result } from "@fludge/utils/trycatch";
import type { Sale } from "@fludge/api/modules/sales/domain/entities/sale.entity";

export type SalePaymentApplication = {
  sale: Sale;
  amountApplied: number;
};

export class PaySaleService {
  constructor(private readonly _saleRepository: SaleRepository) {}

  public async execute(
    activeOrganization: Organization,
    customerId: string,
    amount: number,
  ): Promise<Result<SalePaymentApplication[], Error>> {
    const [sales, errFind] = await this._saleRepository.findByCustomer(
      activeOrganization.id.toString(),
      customerId,
    );

    if (errFind) throw err(errFind);

    if (sales.length === 0) return ok([]);

    const applications: SalePaymentApplication[] = [];

    let remainingAmount = amount;

    for (const sale of sales) {
      if (sale.status.isCompleted()) continue;

      const amountToPay = Math.min(remainingAmount, sale.remaining);

      if (amountToPay <= 0) break;

      sale.pay(amountToPay);
      remainingAmount -= amountToPay;

      applications.push({ sale, amountApplied: amountToPay });
    }

    return ok(applications);
  }
}