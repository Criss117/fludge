import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { Sale } from "../entities/sale.entity";

export interface SaleRepository {
  findById(
    organizationId: string,
    saleId: string,
  ): Promise<Result<Sale | null, Error>>;

  save(
    saleEntity: Sale,
    options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>>;

  saveOnlySale(
    saleEntity: Sale,
    options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>>;

  transaction<T>(fn: (tx: TransactionService) => Promise<T>): Promise<Result<T, Error>>;
}
