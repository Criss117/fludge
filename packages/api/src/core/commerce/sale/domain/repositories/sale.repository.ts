import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { Sale } from "../entities/sale.entity";
import type { TransactionalRepository } from "@fludge/api/core/shared/repositories/transactional-repository";

export type Options = {
  tx?: TransactionService;
};

export interface SaleRepository extends TransactionalRepository {
  findById(
    organizationId: string,
    saleId: string,
  ): Promise<Result<Sale | null>>;

  findByIds(organizationId: string, saleIds: string[]): Promise<Result<Sale[]>>;

  findOpenByCustomer(
    organizationId: string,
    customerId: string,
  ): Promise<Result<Sale[]>>;

  insert(sale: Sale, options?: Options): Promise<Result<void>>;

  /** Actualiza sale + items del aggregate completo. */
  update(sale: Sale, options?: Options): Promise<Result<void>>;

  /** Solo actualiza la tabla sale, sin tocar items. */
  updateOnlySale(sale: Sale, options?: Options): Promise<Result<void>>;

  updateMany(sales: Sale[], options?: Options): Promise<Result<void>>;

  /** Solo actualiza la tabla sale para múltiples ventas, sin tocar items. */
  updateManyOnlySale(sales: Sale[], options?: Options): Promise<Result<void>>;
}
