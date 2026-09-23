import type { Result } from "@fludge/utils/trycatch";
import type { TransactionService } from "@fludge/db";
import type { Customer } from "../entities/customer.entity";
import type { TransactionalRepository } from "../../../../shared/repositories/transactional-repository";

export type Options = {
  tx?: TransactionService;
};

export interface CustomerRepository extends TransactionalRepository {
  findById(
    organizationId: string,
    customerId: string,
  ): Promise<Result<Customer | null>>;

  findByDocument(
    organizationId: string,
    documentNumber: string,
  ): Promise<Result<Customer | null>>;

  insert(customer: Customer, options?: Options): Promise<Result<void>>;

  update(customer: Customer, options?: Options): Promise<Result<void>>;
}
