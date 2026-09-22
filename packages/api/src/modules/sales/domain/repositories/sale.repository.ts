import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { Sale } from "../entities/sale.entity";
import type { ITransactionalRepository } from "@fludge/api/modules/shared/infrastructure/repositories/transactional-repository";

export interface SaleRepository extends ITransactionalRepository {
  findById(
    organizationId: string,
    saleId: string,
  ): Promise<Result<Sale | null, Error>>;

  findByCustomer(
    organizationId: string,
    customerId: string,
  ): Promise<Result<Sale[], Error>>;

  save(
    saleEntity: Sale,
    options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>>;

  saveOnlySale(
    saleEntity: Sale,
    options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>>;

  saveOnlySales(
    saleEntity: Sale[],
    options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>>;
}
