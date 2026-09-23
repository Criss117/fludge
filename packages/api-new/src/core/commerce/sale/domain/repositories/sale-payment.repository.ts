import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { SalePayment } from "../entities/sale-payment.entity";
import type { TransactionalRepository } from "@core/shared/repositories/transactional-repository";

export type Options = {
  tx?: TransactionService;
};

export interface SalePaymentRepository extends TransactionalRepository {
  insertMany(
    salePayments: SalePayment[],
    options?: Options,
  ): Promise<Result<void>>;
}
