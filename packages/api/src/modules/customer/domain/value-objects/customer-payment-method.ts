import type { CustomerPaymentMethodEnum } from "@fludge/utils/enums/db-enums";

export class CustomerPaymentMethod {
  constructor(private readonly _value: CustomerPaymentMethodEnum) {}

  public isCash() {
    return this._value === "cash";
  }

  public isTransfer() {
    return this._value === "transfer";
  }

  public get value() {
    return this._value;
  }
}