import type { TransactionalRepository } from "@fludge/api/core/shared/repositories/transactional-repository";
import type { TransactionService } from "@fludge/db";
import type { Result } from "@fludge/utils/trycatch";

import type { CustomerPayment } from "../entities/customer-payment.entity";

export type Options = {
  tx?: TransactionService;
};

export interface CustomerPaymentRepository extends TransactionalRepository {
  insert(customerPayment: CustomerPayment, options?: Options): Promise<Result<void>>;

  delete(customerPaymentId: string, options?: Options): Promise<Result<void>>;
}
