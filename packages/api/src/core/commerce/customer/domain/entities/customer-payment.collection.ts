import { CustomerPaymentNotFoundException } from "../exceptions/customer-payment-not-found.exception";
import type { CustomerPayment } from "./customer-payment.entity";

export class CustomerPaymentCollection {
  private readonly _payments: Map<string, CustomerPayment>;

  constructor(payments: CustomerPayment[] = []) {
    this._payments = new Map(payments.map((p) => [p.id.toString(), p]));
  }

  public findById(id: string) {
    return this._payments.get(id) ?? null;
  }

  public add(payment: CustomerPayment) {
    this._payments.set(payment.id.toString(), payment);
  }

  public remove(id: string): CustomerPayment {
    const existing = this._payments.get(id);

    if (!existing) throw new CustomerPaymentNotFoundException();

    this._payments.delete(id);

    return existing;
  }

  public getAll() {
    return Array.from(this._payments.values());
  }

  public get length() {
    return this._payments.size;
  }
}
