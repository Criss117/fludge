import type { z } from "zod";
import { Customer } from "@fludge/api/core/commerce/customer/domain/entities/customer.entity";
import { CustomerAlreadyExistsException } from "@fludge/api/core/commerce/customer/domain/exceptions/customer-already-exists.exception";
import type { CustomerRepository } from "@fludge/api/core/commerce/customer/domain/repositories/customer.repository";
import type { UserAuthContext } from "@fludge/api/core/iam/domain/entities/user-auth-context.entity";
import { InternalServerError } from "@fludge/api/core/shared/exceptions/base-exception";
import { createCustomerValidator } from "@fludge/utils/validators/customer.validators";

export const createCustomerCommand = createCustomerValidator;

type CMD = z.infer<typeof createCustomerCommand>;

export class CreateCustomerCommand {
  constructor(private readonly customerRepository: CustomerRepository) {}

  public async execute(authContext: UserAuthContext, cmd: CMD) {
    const organizationId = authContext.organizationId.toString();

    if (cmd.documentNumber) {
      const [existingCustomer, errFind] =
        await this.customerRepository.findByDocument(
          organizationId,
          cmd.documentNumber,
        );

      if (errFind)
        throw new InternalServerError(
          errFind,
          "api_errors.customers.isr_on_find",
        );

      if (existingCustomer) throw new CustomerAlreadyExistsException();
    }

    const customer = Customer.create({
      organizationId: authContext.organizationId,
      createdBy: authContext.member.id,
      name: cmd.name,
      phone: cmd.phone,
      email: cmd.email,
      creditLimit: cmd.creditLimit,
      documentType: cmd.documentType,
      documentNumber: cmd.documentNumber,
    });

    const [, errSaving] = await this.customerRepository.insert(customer);

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "api_errors.customers.isr_on_save",
      );

    return customer.values;
  }
}
