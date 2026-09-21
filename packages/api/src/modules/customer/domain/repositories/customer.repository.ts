import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { Customer } from "../entities/customer.entity";

export interface CustomerRepository {
  findById(
    organizationId: string,
    customerId: string,
  ): Promise<Result<Customer | null, Error>>;

  findByDocument(
    organizationId: string,
    documentNumber: string,
  ): Promise<Result<Customer | null, Error>>;

  save(
    customerEntity: Customer,
    options?: { tx?: TransactionService },
  ): Promise<Result<unknown, Error>>;
}
