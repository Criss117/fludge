import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { SalePayment } from "../entities/sale-payment.entity";
import type { TransactionalRepository } from "../../../../shared/repositories/transactional-repository";

export type Options = {
  tx?: TransactionService;
};

export interface SalePaymentRepository extends TransactionalRepository {
  findByCustomerPaymentId(
    organizationId: string,
    customerPaymentId: string,
  ): Promise<Result<SalePayment[]>>;

  insertMany(
    salePayments: SalePayment[],
    options?: Options,
  ): Promise<Result<void>>;

  deleteMany(
    salePaymentIds: string[],
    options?: Options,
  ): Promise<Result<void>>;

  deleteBySaleId(
    saleId: string,
    options?: Options,
  ): Promise<Result<void>>;
}
