import { createCustomerPaymentValidator } from "@fludge/utils/validators/customer-payment.validators";
import type { z } from "zod";
import type { CustomerRepository } from "@fludge/api/modules/customer/domain/repositories/customer.repository";
import type { SaleRepository } from "@fludge/api/modules/sales/domain/repositories/sale.repository";
import type { PaySaleService } from "@fludge/api/modules/sales/application/services/pay-sale.service";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { UUID } from "@fludge/utils/uuid";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { CustomerNotFoundException } from "@fludge/api/modules/customer/domain/exceptions/customer-not-found.exception";
import type { CustomerPaymentRepository } from "@fludge/api/modules/customer/domain/repositories/customer-payment.repository";
import type { SalePaymentRepository } from "@fludge/api/modules/sales/domain/repositories/sale-payment.repository";

export const createCustomerPaymentCommand = createCustomerPaymentValidator;

type CMD = z.infer<typeof createCustomerPaymentCommand>;

export class CreateCustomerPaymentCommand {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly customerPaymentRepository: CustomerPaymentRepository,
    private readonly salePaymentRepository: SalePaymentRepository,
    private readonly saleRepository: SaleRepository,
    private readonly paySaleService: PaySaleService,
  ) {}

  public async execute(
    loggedUserId: string,
    activeOrganization: Organization,
    cmd: CMD,
  ) {
    const loggedMember = activeOrganization.members.getMemberByUserId(
      UUID.fromString(loggedUserId),
    )!;

    const [customer, errFindCustomer] = await this.customerRepository.findById(
      activeOrganization.id.toString(),
      cmd.customerId,
    );

    if (errFindCustomer)
      throw new InternalServerError(
        errFindCustomer,
        "api_errors.customers.isr_on_find",
      );

    if (!customer) throw new CustomerNotFoundException();

    const newPayment = customer.recordPayment(
      cmd.amount,
      cmd.method,
      cmd.notes ?? null,
      loggedMember.id,
    );

    const [values, errPay] = await this.paySaleService.execute(
      activeOrganization,
      customer.id.toString(),
      newPayment,
    );

    if (errPay)
      throw new InternalServerError(errPay, "api_errors.sales.isr_on_save");

    const [, errTransaction] = await this.saleRepository.transaction(
      async (tx) => {
        const [, errCustomerPayment] =
          await this.customerPaymentRepository.save(newPayment, { tx });

        if (errCustomerPayment) throw errCustomerPayment;

        const [, errCustomer] = await this.customerRepository.save(customer, {
          tx,
        });

        if (errCustomer) throw errCustomer;

        if (values.length > 0) {
          const sales = values.map((v) => v.sale);
          const salePayments = values.map((v) => v.salePayments);

          const [, errSales] = await this.saleRepository.saveOnlySales(sales, {
            tx,
          });

          if (errSales) throw errSales;

          const [, errSalePayments] = await this.salePaymentRepository.save(
            salePayments,
            { tx },
          );

          if (errSalePayments) throw errSalePayments;
        }
      },
    );

    if (errTransaction)
      throw new InternalServerError(
        errTransaction,
        "api_errors.sales.isr_on_save",
      );

    return {
      customer: customer.values,
      payment: newPayment.values,
      salePayments: values.map((v) => v.salePayments.values),
    };
  }
}
