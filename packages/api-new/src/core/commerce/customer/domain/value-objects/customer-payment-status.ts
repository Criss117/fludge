import type { CustomerPaymentStatusEnum } from "@fludge/utils/enums/db-enums";

export class CustomerPaymentStatus {
  constructor(private readonly _value: CustomerPaymentStatusEnum) {}

  public isActive() {
    return this._value === "active";
  }

  public isCancelled() {
    return this._value === "cancelled";
  }

  public get value() {
    return this._value;
  }
}
