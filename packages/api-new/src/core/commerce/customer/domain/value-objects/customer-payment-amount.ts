import { InvalidPaymentAmountException } from "../exceptions/invalid-payment-amount.exception";

export class CustomerPaymentAmount {
  constructor(private readonly _value: number) {
    if (_value <= 0) {
      throw new InvalidPaymentAmountException();
    }
  }

  public get value() {
    return this._value;
  }
}
