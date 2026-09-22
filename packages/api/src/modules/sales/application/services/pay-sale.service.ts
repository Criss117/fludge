import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import type { SaleRepository } from "@fludge/api/modules/sales/domain/repositories/sale.repository";
import { err, ok } from "@fludge/utils/trycatch";
import type { Sale } from "@fludge/api/modules/sales/domain/entities/sale.entity";

export class PaySaleService {
  constructor(private readonly _saleRepository: SaleRepository) {}

  public async execute(
    activeOrganization: Organization,
    customerId: string,
    amount: number,
  ) {
    const [sales, errFind] = await this._saleRepository.findByCustomer(
      activeOrganization.id.toString(),
      customerId,
    );

    if (errFind) throw err(errFind);

    if (sales.length === 0) return ok([]);

    const salesToSave: Sale[] = [];

    let remainingAmount = amount;

    for (const sale of sales) {
      if (sale.status.isCompleted()) continue;

      remainingAmount -= sale.remaining;
      sale.pay(remainingAmount);

      salesToSave.push(sale);
    }

    return ok(salesToSave);
  }
}
