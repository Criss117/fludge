import { createCustomerPaymentValidator } from "@fludge/utils/validators/customer-payment.validators";
import type { z } from "zod";
import type { CustomerRepository } from "@fludge/api/modules/customer/domain/repositories/customer.repository";
import type { CustomerPaymentRepository } from "@fludge/api/modules/customer/domain/repositories/customer-payment.repository";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { UUID } from "@fludge/utils/uuid";
import {
  InternalServerError,
  NotFoundError,
} from "@fludge/api/modules/shared/domain/exceptions/base-exception";

export const createCustomerPaymentCommand = createCustomerPaymentValidator;

type CMD = z.infer<typeof createCustomerPaymentCommand>;

export class CreateCustomerPaymentCommand {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly customerPaymentRepository: CustomerPaymentRepository,
  ) {}

  public async execute(
    activeOrganization: Organization,
    loggedUserId: string,
    cmd: CMD,
  ) {
    const [existingCustomer, errFind] =
      await this.customerRepository.findById(
        activeOrganization.id.toString(),
        cmd.customerId,
      );

    if (errFind)
      throw new InternalServerError(
        errFind,
        "api_errors.customers.isr_on_find",
      );

    if (!existingCustomer)
      throw new NotFoundError("api_errors.customers.not_found");

    const payment = existingCustomer.recordPayment(
      cmd.amount,
      cmd.method,
      cmd.notes ?? null,
      UUID.fromString(loggedUserId),
    );

    const [, errSaveCustomer] = await this.customerRepository.save(
      existingCustomer,
    );

    if (errSaveCustomer)
      throw new InternalServerError(
        errSaveCustomer,
        "api_errors.customers.isr_on_save",
      );

    const [, errSavePayment] = await this.customerPaymentRepository.save(
      payment,
    );

    if (errSavePayment)
      throw new InternalServerError(
        errSavePayment,
        "api_errors.customer_payments.isr_on_save",
      );

    return payment.values;
  }
}
