import type { Customer } from "../../../../commerce/customer/domain/entities/customer.entity";
import type { CustomerRepository } from "../../../../commerce/customer/domain/repositories/customer.repository";
import { CustomerNotFoundException } from "../../../../commerce/customer/domain/exceptions/customer-not-found.exception";
import { InternalServerError } from "../../../../shared/exceptions/base-exception";

/**
 * Disminuye el balance de un customer.
 * La entidad valida que el balance no sea menor a 0.
 * Retorna el customer modificado para que el command lo persista.
 */
export class DecreaseCustomerBalanceService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  public async execute(
    organizationId: string,
    customerId: string,
    amount: number,
  ): Promise<Customer> {
    const [customer, errFind] = await this.customerRepository.findById(
      organizationId,
      customerId,
    );

    if (errFind)
      throw new InternalServerError(
        errFind,
        "api_errors.customers.isr_on_find",
      );

    if (!customer) throw new CustomerNotFoundException();

    customer.decreaseBalance(amount);

    return customer;
  }
}
