import type { CustomerRepository } from "@fludge/api/modules/customer/infrastructure/repositories/customer.repository";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { err, ok } from "@fludge/utils/trycatch";

export class UpdateCustomerBalanceService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  public async increase(
    activeOrganization: Organization,
    customerId: string,
    amount: number,
  ) {
    const [existingCustomer, errFind] = await this.customerRepository.findById(
      activeOrganization.id.toString(),
      customerId,
    );

    if (errFind) return err(errFind);

    if (!existingCustomer) return ok(null);

    existingCustomer.increaseBalance(amount);

    return ok(existingCustomer);
  }

  public async decrease(
    activeOrganization: Organization,
    customerId: string,
    amount: number,
  ) {
    const [existingCustomer, errFind] = await this.customerRepository.findById(
      activeOrganization.id.toString(),
      customerId,
    );

    if (errFind) return err(errFind);

    if (!existingCustomer) return ok(null);

    existingCustomer.decreaseBalance(amount);

    return ok(existingCustomer);
  }
}
