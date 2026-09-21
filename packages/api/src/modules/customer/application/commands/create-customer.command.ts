import { createCustomerValidator } from "@fludge/utils/validators/customer.validators";
import type { z } from "zod";
import type { CustomerRepository } from "@fludge/api/modules/customer/domain/repositories/customer.repository";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { UUID } from "@fludge/utils/uuid";
import { Customer } from "@fludge/api/modules/customer/domain/entities/customer.entity";
import {
  ConflictError,
  InternalServerError,
} from "@fludge/api/modules/shared/domain/exceptions/base-exception";

export const createCustomerCommand = createCustomerValidator;

type CMD = z.infer<typeof createCustomerCommand>;

export class CreateCustomerCommand {
  constructor(private readonly customerRepository: CustomerRepository) {}

  public async execute(
    activeOrganization: Organization,
    loggedUserId: string,
    cmd: CMD,
  ) {
    const loggedMember = activeOrganization.members.getMemberByUserId(
      UUID.fromString(loggedUserId),
    )!;

    if (cmd.documentNumber) {
      const [existingCustomer, errFind] =
        await this.customerRepository.findByDocument(
          activeOrganization.id.toString(),
          cmd.documentNumber,
        );

      if (errFind)
        throw new InternalServerError(
          errFind,
          "api_errors.customers.isr_on_find",
        );

      if (existingCustomer)
        throw new ConflictError("api_errors.customers.document_taken");
    }

    const customer = Customer.create({
      organizationId: activeOrganization.id,
      createdBy: loggedMember.id,
      name: cmd.name,
      phone: cmd.phone,
      email: cmd.email,
      creditLimit: cmd.creditLimit,
      documentType: cmd.documentType,
      documentNumber: cmd.documentNumber,
    });

    const [, errSaving] = await this.customerRepository.save(customer);

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "api_errors.customers.isr_on_save",
      );

    return customer.values;
  }
}
