import type { PaymentTypeEnum } from "@fludge/utils/enums/db-enums";

export class PaymentType {
  private readonly _value: PaymentTypeEnum;

  constructor(value: PaymentTypeEnum) {
    this._value = value;
  }

  public equals(paymentType: PaymentType) {
    return this._value === paymentType._value;
  }

  public isCash() {
    return this._value === "cash";
  }

  public isCredit() {
    return this._value === "credit";
  }

  public get value() {
    return this._value;
  }
}
