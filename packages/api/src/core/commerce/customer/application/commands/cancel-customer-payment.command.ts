import type { z } from "zod";
import type { CustomerRepository } from "@fludge/api/core/commerce/customer/domain/repositories/customer.repository";
import type { CustomerPaymentRepository } from "@fludge/api/core/commerce/customer/domain/repositories/customer-payment.repository";
import type { SaleRepository } from "@fludge/api/core/commerce/sale/domain/repositories/sale.repository";
import type { SalePaymentRepository } from "@fludge/api/core/commerce/sale/domain/repositories/sale-payment.repository";
import type { RevertSalePaymentsService } from "@fludge/api/core/commerce/sale/application/services/revert-sale-payments.service";
import { CustomerNotFoundException } from "@fludge/api/core/commerce/customer/domain/exceptions/customer-not-found.exception";
import type { UserAuthContext } from "@fludge/api/core/iam/domain/entities/user-auth-context.entity";
import { InternalServerError } from "@fludge/api/core/shared/exceptions/base-exception";
import { cancelCustomerPaymentValidator } from "@fludge/utils/validators/customer-payment.validators";

export const cancelCustomerPaymentCommand = cancelCustomerPaymentValidator;

type CMD = z.infer<typeof cancelCustomerPaymentCommand>;

export class CancelCustomerPaymentCommand {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly customerPaymentRepository: CustomerPaymentRepository,
    private readonly saleRepository: SaleRepository,
    private readonly salePaymentRepository: SalePaymentRepository,
    private readonly revertSalePaymentsService: RevertSalePaymentsService,
  ) {}

  public async execute(authContext: UserAuthContext, cmd: CMD) {
    const organizationId = authContext.organizationId.toString();

    // 1. Buscar customer con sus pagos cargados
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

    // 2. Eliminar el pago del customer (aumenta balance, remueve de la colección)
    const removedPayment = customer.cancelPayment(cmd.paymentId);

    // 3. Revertir el efecto en ventas (modifica sales in-memory, obtiene IDs a eliminar)
    const { sales, salePaymentsToDelete } =
      await this.revertSalePaymentsService.execute(
        organizationId,
        cmd.paymentId,
      );

    // 4. Persistir todo en una transacción (mínimas llamadas a DB)
    const [, errTransaction] = await this.saleRepository.transaction(
      async (tx) => {
        // Eliminar CustomerPayment
        const [, errPayment] = await this.customerPaymentRepository.delete(
          removedPayment.id.toString(),
          { tx },
        );

        if (errPayment) throw errPayment;

        // Actualizar Customer (balance restaurado)
        const [, errCustomer] = await this.customerRepository.update(customer, {
          tx,
        });

        if (errCustomer) throw errCustomer;

        // Actualizar ventas afectadas (totalPaid y status revertidos)
        if (sales.length > 0) {
          const [, errSales] = await this.saleRepository.updateManyOnlySale(
            sales,
            {
              tx,
            },
          );

          if (errSales) throw errSales;
        }

        // Eliminar SalePayments vinculados
        if (salePaymentsToDelete.length > 0) {
          const [, errDelete] = await this.salePaymentRepository.deleteMany(
            salePaymentsToDelete.map((sp) => sp.id.toString()),
            { tx },
          );

          if (errDelete) throw errDelete;
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
      payment: removedPayment.values,
      affectedSales: sales.map((s) => s.values),
    };
  }
}
