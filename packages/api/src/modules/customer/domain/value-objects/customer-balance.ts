import { AmountMustBePositiveException } from "@fludge/api/modules/shared/domain/exceptions/amount-must-be-positive.exception";
import { CantIncreaseBalanceException } from "../exceptions/cant-increase-balance.exception";
import { CantDecreaseBalanceException } from "../exceptions/cant-decrease-balance.exception";

export class CustomerBalance {
  constructor(
    private readonly _balance: number,
    private readonly _creditLimit: number,
  ) {
    if (_balance < 0) {
      throw new Error("Balance cannot be negative");
    }
    if (_creditLimit < 0) {
      throw new Error("Credit limit cannot be negative");
    }
  }

  public static zero(creditLimit: number = 0): CustomerBalance {
    return new CustomerBalance(0, creditLimit);
  }

  public get balance() {
    return this._balance;
  }

  public get creditLimit() {
    return this._creditLimit;
  }

  /** Cuánto puede seguir debiendo el cliente antes de tocar el límite. */
  public get availableCredit() {
    return this._creditLimit - this._balance;
  }

  public isOverLimit() {
    return this._balance > this._creditLimit;
  }

  public hasDebt() {
    return this._balance > 0;
  }

  public isSettled() {
    return this._balance === 0;
  }

  public canIncrease(amount: number): boolean {
    if (amount < 0) throw new AmountMustBePositiveException();

    return this._balance + amount <= this._creditLimit;
  }

  public increaseBalance(amount: number): CustomerBalance {
    if (!this.canIncrease(amount)) throw new CantIncreaseBalanceException();

    return new CustomerBalance(this._balance + amount, this._creditLimit);
  }

  /** Disminuye la deuda (ej: un pago/abono del cliente). */
  public decreaseBalance(amount: number): CustomerBalance {
    if (amount < 0) throw new AmountMustBePositiveException();

    if (amount > this._balance) throw new CantDecreaseBalanceException();

    return new CustomerBalance(this._balance - amount, this._creditLimit);
  }

  public withCreditLimit(newLimit: number): CustomerBalance {
    return new CustomerBalance(this._balance, newLimit);
  }

  public equals(other: CustomerBalance): boolean {
    return (
      this._balance === other._balance &&
      this._creditLimit === other._creditLimit
    );
  }

  public get value() {
    return {
      balance: this._balance,
      creditLimit: this._creditLimit,
    };
  }
}
