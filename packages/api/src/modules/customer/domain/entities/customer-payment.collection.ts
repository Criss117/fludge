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

  public update(payment: CustomerPayment) {
    const existing = this.findById(payment.id.toString());

    if (!existing) throw new CustomerPaymentNotFoundException();

    this._payments.set(payment.id.toString(), payment);
  }

  public getAll() {
    return Array.from(this._payments.values());
  }

  public getActive() {
    return this.getAll().filter((p) => p.status === "active");
  }

  public get length() {
    return this._payments.size;
  }
}
