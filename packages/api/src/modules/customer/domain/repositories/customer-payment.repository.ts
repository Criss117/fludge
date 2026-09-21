import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { CustomerPayment } from "../entities/customer-payment.entity";

export interface CustomerPaymentRepository {
  findById(
    organizationId: string,
    paymentId: string,
  ): Promise<Result<CustomerPayment | null, Error>>;

  findByCustomer(
    organizationId: string,
    customerId: string,
  ): Promise<Result<CustomerPayment[], Error>>;

  findActiveByCustomer(
    organizationId: string,
    customerId: string,
  ): Promise<Result<CustomerPayment[], Error>>;

  save(
    payment: CustomerPayment,
    options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>>;
}