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
import type { PaySaleService } from "@fludge/api/modules/sales/application/services/pay-sale.service";
import type { SaleRepository } from "@fludge/api/modules/sales/domain/repositories/sale.repository";

export const createCustomerPaymentCommand = createCustomerPaymentValidator;

type CMD = z.infer<typeof createCustomerPaymentCommand>;

export class CreateCustomerPaymentCommand {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly customerPaymentRepository: CustomerPaymentRepository,
    private readonly saleRepository: SaleRepository,
    private readonly paySaleService: PaySaleService,
  ) {}

  public async execute(
    activeOrganization: Organization,
    loggedUserId: string,
    cmd: CMD,
  ) {
    const [existingCustomer, errFind] = await this.customerRepository.findById(
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

    const [salesToPay, errPaySale] = await this.paySaleService.execute(
      activeOrganization,
      existingCustomer.id.toString(),
      cmd.amount,
    );

    if (errPaySale)
      throw new InternalServerError(errPaySale, "api_errors.sales.isr_on_save");

    const [, errTransaction] = await this.customerRepository.transaction(
      async (tx) => {
        const [, errSaveCustomer] = await this.customerRepository.save(
          existingCustomer,
          { tx },
        );

        if (errSaveCustomer)
          throw new InternalServerError(
            errSaveCustomer,
            "api_errors.customers.isr_on_save",
          );

        const [, errSavePayment] = await this.customerPaymentRepository.save(
          payment,
          { tx },
        );

        if (errSavePayment)
          throw new InternalServerError(
            errSavePayment,
            "api_errors.customer_payments.isr_on_save",
          );

        if (salesToPay.length > 0) {
          const [, errSaveSale] = await this.saleRepository.saveOnlySales(
            salesToPay,
            { tx },
          );

          if (errSaveSale)
            throw new InternalServerError(
              errSaveSale,
              "api_errors.sales.isr_on_save",
            );
        }
      },
    );

    if (errTransaction)
      throw new InternalServerError(
        errTransaction,
        "api_errors.customer_payments.isr_on_save",
      );

    return payment.values;
  }
}
