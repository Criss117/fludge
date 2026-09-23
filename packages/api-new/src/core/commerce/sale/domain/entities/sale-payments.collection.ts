import type { UUID } from "@fludge/utils/uuid";
import type { SalePayment } from "./sale-payment.entity";

export class SalePaymentsCollection {
  private readonly _payments: Map<string, SalePayment>;

  constructor(payments?: SalePayment[]) {
    this._payments = new Map(payments?.map((p) => [p.id.toString(), p]) ?? []);
  }

  public add(payment: SalePayment) {
    this._payments.set(payment.id.toString(), payment);
  }

  public findById(id: string) {
    return this._payments.get(id) ?? null;
  }

  public exists(id: string) {
    return this._payments.has(id);
  }

  public findByCustomerPaymentId(customerPaymentId: UUID | UUID[]) {
    const customerPaymentIdArray = Array.isArray(customerPaymentId)
      ? customerPaymentId
      : [customerPaymentId];
    const payments: SalePayment[] = [];

    for (const payment of this._payments.values()) {
      if (customerPaymentIdArray.some((id) => id.equals(payment.id))) {
        payments.push(payment);
      }
    }

    return payments;
  }

  public get all() {
    return Array.from(this._payments.values());
  }

  public get values() {
    return this._payments;
  }
}
