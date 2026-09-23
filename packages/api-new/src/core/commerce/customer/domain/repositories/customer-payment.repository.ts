import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { CustomerPayment } from "../entities/customer-payment.entity";
import type { TransactionalRepository } from "@core/shared/repositories/transactional-repository";

export type Options = {
  tx?: TransactionService;
};

export interface CustomerPaymentRepository extends TransactionalRepository {
  insert(
    customerPayment: CustomerPayment,
    options?: Options,
  ): Promise<Result<void>>;
}
