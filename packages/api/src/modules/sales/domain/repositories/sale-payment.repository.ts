import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { SalePayment } from "../entities/sale-payments.entity";

type Options = {
  tx?: TransactionService;
};

export interface SalePaymentRepository {
  save(
    salePayment: SalePayment | SalePayment[],
    options?: Options,
  ): Promise<Result<void, Error>>;
}
