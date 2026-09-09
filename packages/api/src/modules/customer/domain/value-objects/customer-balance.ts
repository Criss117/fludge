export class CustomerBalance {
  constructor(
    private readonly _balance: number,
    private readonly _creditLimit: number | null,
  ) {}

  public get value() {
    return {
      balance: this._balance,
      creditLimit: this._creditLimit,
    };
  }
}
