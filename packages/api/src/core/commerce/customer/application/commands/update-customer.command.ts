import type { z } from "zod";
import { CustomerNotFoundException } from "../../../../commerce/customer/domain/exceptions/customer-not-found.exception";
import { CustomerAlreadyExistsException } from "../../../../commerce/customer/domain/exceptions/customer-already-exists.exception";
import type { CustomerRepository } from "../../../../commerce/customer/domain/repositories/customer.repository";
import type { UserAuthContext } from "@fludge/api/core/iam/domain/entities/user-auth-context.entity";
import { InternalServerError } from "@fludge/api/core/shared/exceptions/base-exception";
import { updateCustomerValidator } from "@fludge/utils/validators/customer.validators";

export const updateCustomerCommand = updateCustomerValidator;

type CMD = z.infer<typeof updateCustomerCommand>;

export class UpdateCustomerCommand {
  constructor(private readonly customerRepository: CustomerRepository) {}

  public async execute(authContext: UserAuthContext, cmd: CMD) {
    const organizationId = authContext.organizationId.toString();

    const [existingCustomer, errFind] = await this.customerRepository.findById(
      organizationId,
      cmd.id,
    );

    if (errFind)
      throw new InternalServerError(
        errFind,
        "api_errors.customers.isr_on_find",
      );

    if (!existingCustomer) throw new CustomerNotFoundException();

    if (cmd.documentNumber) {
      const [duplicateCustomer, errDuplicate] =
        await this.customerRepository.findByDocument(
          organizationId,
          cmd.documentNumber,
        );

      if (errDuplicate)
        throw new InternalServerError(
          errDuplicate,
          "api_errors.customers.isr_on_find",
        );

      if (duplicateCustomer && duplicateCustomer.values.id !== cmd.id) {
        throw new CustomerAlreadyExistsException(
          "api_errors.customers.document_taken",
        );
      }
    }

    existingCustomer.update({
      name: cmd.name,
      phone: cmd.phone,
      email: cmd.email,
      creditLimit: cmd.creditLimit,
      documentType: cmd.documentType,
      documentNumber: cmd.documentNumber,
      status: cmd.status,
    });

    const [, errSaving] =
      await this.customerRepository.update(existingCustomer);

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "api_errors.customers.isr_on_save",
      );

    return existingCustomer.values;
  }
}
