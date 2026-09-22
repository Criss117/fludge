import { cancelCustomerPaymentValidator } from "@fludge/utils/validators/customer-payment.validators";
import type { z } from "zod";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import type { CustomerRepository } from "@fludge/api/modules/customer/domain/repositories/customer.repository";
import type { CustomerPaymentRepository } from "@fludge/api/modules/customer/domain/repositories/customer-payment.repository";
import type { CustomerPaymentApplicationRepository } from "@fludge/api/modules/customer/domain/repositories/customer-payment-application.repository";
import type { SaleRepository } from "@fludge/api/modules/sales/domain/repositories/sale.repository";
import type { Sale } from "@fludge/api/modules/sales/domain/entities/sale.entity";
import {
  InternalServerError,
  NotFoundError,
} from "@fludge/api/modules/shared/domain/exceptions/base-exception";

export const cancelCustomerPaymentCommand = cancelCustomerPaymentValidator;

type CMD = z.infer<typeof cancelCustomerPaymentCommand>;

export class CancelCustomerPaymentCommand {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly customerPaymentRepository: CustomerPaymentRepository,
    private readonly customerPaymentApplicationRepository: CustomerPaymentApplicationRepository,
    private readonly saleRepository: SaleRepository,
  ) {}

  public async execute(activeOrganization: Organization, cmd: CMD) {
    const organizationId = activeOrganization.id.toString();

    const [payment, errFindPayment] =
      await this.customerPaymentRepository.findById(
        organizationId,
        cmd.paymentId,
      );

    if (errFindPayment) throw new InternalServerError(errFindPayment);

    if (!payment) throw new NotFoundError("api_errors.customer_payments.not_found");

    const paymentId = payment.id.toString();

    const [customer, errFindCustomer] = await this.customerRepository.findById(
      organizationId,
      payment.customerId.toString(),
    );

    if (errFindCustomer)
      throw new InternalServerError(
        errFindCustomer,
        "api_errors.customers.isr_on_find",
      );

    if (!customer) throw new NotFoundError("api_errors.customers.not_found");

    const [applications, errFindApplications] =
      await this.customerPaymentApplicationRepository.findByPaymentId(
        organizationId,
        paymentId,
      );

    if (errFindApplications) throw new InternalServerError(errFindApplications);

    const salesToSave: Sale[] = [];

    for (const application of applications) {
      const [sale, errFindSale] = await this.saleRepository.findById(
        organizationId,
        application.saleId.toString(),
      );

      if (errFindSale)
        throw new InternalServerError(
          errFindSale,
          "api_errors.sales.isr_on_find",
        );

      if (!sale) throw new NotFoundError("api_errors.sales.not_found");

      sale.revertPayment(application.amount);
      salesToSave.push(sale);
    }

    // Cancela el pago dentro del aggregate del cliente: marca el pago como
    // cancelled y restaura el saldo. Devuelve la entidad de pago cancelada,
    // que es la que se persiste (es la misma instancia que `payment` en los
    // tests; en producción es la del collection del cliente).
    const cancelledPayment = customer.cancelPayment(paymentId, cmd.reason);

    const [, errTransaction] = await this.customerRepository.transaction(
      async (tx) => {
        const [, errSaveCustomer] = await this.customerRepository.save(
          customer,
          { tx },
        );

        if (errSaveCustomer)
          throw new InternalServerError(
            errSaveCustomer,
            "api_errors.customers.isr_on_save",
          );

        const [, errSavePayment] = await this.customerPaymentRepository.save(
          cancelledPayment,
          { tx },
        );

        if (errSavePayment)
          throw new InternalServerError(
            errSavePayment,
            "api_errors.customer_payments.isr_on_save",
          );

        if (salesToSave.length > 0) {
          const [, errSaveSales] = await this.saleRepository.saveOnlySales(
            salesToSave,
            { tx },
          );

          if (errSaveSales)
            throw new InternalServerError(
              errSaveSales,
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

    return cancelledPayment.values;
  }
}