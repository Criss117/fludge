import type { z } from "zod";
import type { CustomerRepository } from "@core/commerce/customer/domain/repositories/customer.repository";
import type { CustomerPaymentRepository } from "@core/commerce/customer/domain/repositories/customer-payment.repository";
import type { SaleRepository } from "@core/commerce/sale/domain/repositories/sale.repository";
import type { SalePaymentRepository } from "@core/commerce/sale/domain/repositories/sale-payment.repository";
import type { PaySaleService } from "@core/commerce/sale/application/services/pay-sale.service";
import { CustomerNotFoundException } from "@core/commerce/customer/domain/exceptions/customer-not-found.exception";
import type { UserAuthContext } from "@core/iam/domain/entities/user-auth-context.entity";
import { InternalServerError } from "@core/shared/exceptions/base-exception";
import { createCustomerPaymentValidator } from "@fludge/utils/validators/customer-payment.validators";

export const createCustomerPaymentCommand = createCustomerPaymentValidator;

type CMD = z.infer<typeof createCustomerPaymentCommand>;

export class CreateCustomerPaymentCommand {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly customerPaymentRepository: CustomerPaymentRepository,
    private readonly saleRepository: SaleRepository,
    private readonly salePaymentRepository: SalePaymentRepository,
    private readonly paySaleService: PaySaleService,
  ) {}

  public async execute(authContext: UserAuthContext, cmd: CMD) {
    const organizationId = authContext.organizationId.toString();

    const [customer, errFindCustomer] = await this.customerRepository.findById(
      organizationId,
      cmd.customerId,
    );

    if (errFindCustomer)
      throw new InternalServerError(
        errFindCustomer,
        "api_errors.customers.isr_on_find",
      );

    if (!customer) throw new CustomerNotFoundException();

    // 1. Registrar el pago en el customer (reduce balance, crea CustomerPayment)
    const newPayment = customer.recordPayment(
      cmd.amount,
      cmd.method,
      cmd.notes ?? null,
      authContext.member.id,
    );

    // 2. Distribuir el pago entre las ventas abiertas/parciales del cliente
    const payResults = await this.paySaleService.execute(
      organizationId,
      cmd.customerId,
      newPayment.id,
      cmd.amount,
      authContext.member.id,
    );

    // Recolectar entidades para batch
    const salesToUpdate = payResults.map((r) => r.sale);
    const salePaymentsToInsert = payResults.flatMap((r) => r.salePayments);

    // 3. Persistir todo en una transacción (mínimas llamadas a DB)
    const [, errTransaction] = await this.saleRepository.transaction(
      async (tx) => {
        const [, errPayment] = await this.customerPaymentRepository.insert(
          newPayment,
          { tx },
        );

        if (errPayment) throw errPayment;

        const [, errCustomer] = await this.customerRepository.update(customer, {
          tx,
        });

        if (errCustomer) throw errCustomer;

        if (salesToUpdate.length > 0) {
          const [, errSales] = await this.saleRepository.updateMany(
            salesToUpdate,
            { tx },
          );

          if (errSales) throw errSales;
        }

        if (salePaymentsToInsert.length > 0) {
          const [, errSalePayments] =
            await this.salePaymentRepository.insertMany(salePaymentsToInsert, {
              tx,
            });

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
      salePayments: salePaymentsToInsert.map((sp) => sp.values),
    };
  }
}
