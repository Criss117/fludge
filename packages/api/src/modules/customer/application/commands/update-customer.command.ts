import { updateCustomerValidator } from "@fludge/utils/validators/customer.validators";
import type { z } from "zod";
import type { CustomerRepository } from "@fludge/api/modules/customer/domain/repositories/customer.repository";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "@fludge/api/modules/shared/domain/exceptions/base-exception";

export const updateCustomerCommand = updateCustomerValidator;

type CMD = z.infer<typeof updateCustomerCommand>;

export class UpdateCustomerCommand {
  constructor(private readonly customerRepository: CustomerRepository) {}

  public async execute(activeOrganization: Organization, cmd: CMD) {
    const [existingCustomer, errFind] = await this.customerRepository.findById(
      activeOrganization.id.toString(),
      cmd.id,
    );

    if (errFind)
      throw new InternalServerError(
        errFind,
        "api_errors.customers.isr_on_find",
      );

    if (!existingCustomer)
      throw new NotFoundError("api_errors.customers.not_found");

    if (cmd.documentNumber) {
      const [duplicateCustomer, errDuplicate] =
        await this.customerRepository.findByDocument(
          activeOrganization.id.toString(),
          cmd.documentNumber,
        );

      if (errDuplicate)
        throw new InternalServerError(
          errDuplicate,
          "api_errors.customers.isr_on_find",
        );

      if (duplicateCustomer && duplicateCustomer.values.id !== cmd.id) {
        throw new ConflictError("api_errors.customers.document_taken");
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

    const [, errSaving] = await this.customerRepository.save(existingCustomer);

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "api_errors.customers.isr_on_save",
      );

    return existingCustomer.values;
  }
}
