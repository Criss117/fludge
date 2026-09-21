import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { Sale } from "../entities/sale.entity";

export interface SaleItemRepository {
  save(
    saleEntity: Sale,
    options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>>;
}
