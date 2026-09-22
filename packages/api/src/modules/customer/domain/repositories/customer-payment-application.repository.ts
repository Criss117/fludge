import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { CustomerPaymentApplication } from "../entities/customer-payment-application.entity";
import type { ITransactionalRepository } from "@fludge/api/modules/shared/infrastructure/repositories/transactional-repository";

export interface CustomerPaymentApplicationRepository
  extends ITransactionalRepository {
  findByPaymentId(
    organizationId: string,
    paymentId: string,
  ): Promise<Result<CustomerPaymentApplication[], Error>>;

  save(
    application: CustomerPaymentApplication,
    options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>>;

  saveMany(
    applications: CustomerPaymentApplication[],
    options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>>;
}