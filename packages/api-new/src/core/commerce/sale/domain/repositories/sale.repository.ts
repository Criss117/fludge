import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { Sale } from "../entities/sale.entity";
import type { TransactionalRepository } from "@core/shared/repositories/transactional-repository";

export type Options = {
  tx?: TransactionService;
};

export interface SaleRepository extends TransactionalRepository {
  findById(
    organizationId: string,
    saleId: string,
  ): Promise<Result<Sale | null>>;

  findOpenByCustomer(
    organizationId: string,
    customerId: string,
  ): Promise<Result<Sale[]>>;

  insert(sale: Sale, options?: Options): Promise<Result<void>>;

  update(sale: Sale, options?: Options): Promise<Result<void>>;

  updateMany(sales: Sale[], options?: Options): Promise<Result<void>>;
}
