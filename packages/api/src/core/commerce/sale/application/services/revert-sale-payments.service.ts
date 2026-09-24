import type { Sale } from "../../../../commerce/sale/domain/entities/sale.entity";
import type { SalePaymentRepository } from "../../../../commerce/sale/domain/repositories/sale-payment.repository";
import type { SaleRepository } from "../../../../commerce/sale/domain/repositories/sale.repository";
import { InternalServerError } from "@fludge/api/core/shared/exceptions/base-exception";
import { UUID } from "@fludge/utils/uuid";
import type { SalePayment } from "../../domain/entities/sale-payment.entity";

export interface RevertSalePaymentsResult {
  sales: Sale[];
  salePaymentsToDelete: SalePayment[];
}

/**
 * Revierte los efectos de un CustomerPayment sobre las ventas.
 * - Encuentra los SalePayments vinculados al CustomerPayment
 * - Revierte el totalPaid y status de cada Sale afectada
 * - Retorna las Sales modificadas y los IDs de SalePayment a eliminar
 */
export class RevertSalePaymentsService {
  constructor(
    private readonly salePaymentRepository: SalePaymentRepository,
    private readonly saleRepository: SaleRepository,
  ) {}

  public async execute(
    organizationId: string,
    customerPaymentId: string,
  ): Promise<RevertSalePaymentsResult> {
    // 1. Buscar SalePayments vinculados a este CustomerPayment
    const [salePayments, errFind] =
      await this.salePaymentRepository.findByCustomerPaymentId(
        organizationId,
        customerPaymentId,
      );

    if (errFind)
      throw new InternalServerError(errFind, "api_errors.sales.isr_on_find");

    if (salePayments.length === 0)
      return { sales: [], salePaymentsToDelete: [] };

    // 2. Obtener IDs únicos de ventas afectadas
    const saleIds = [...new Set(salePayments.map((sp) => sp.values.saleId))];

    // 3. Buscar esas ventas (con sus payments cargados)
    const [sales, errSales] = await this.saleRepository.findByIds(
      organizationId,
      saleIds,
    );

    if (errSales)
      throw new InternalServerError(errSales, "api_errors.sales.isr_on_find");

    // 4. Revertir el pago en cada venta (modifica totalPaid y status in-memory)
    const customerPaymentUUID = UUID.fromString(customerPaymentId);

    const salePaymentsToDelete: SalePayment[] = [];

    for (const sale of sales) {
      const paymentsToRevert = sale.revertPayment([customerPaymentUUID]);

      salePaymentsToDelete.push(...paymentsToRevert);
    }

    return {
      sales,
      salePaymentsToDelete,
    };
  }
}
