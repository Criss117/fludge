export class CustomerPaymentCancellation {
  constructor(
    private readonly _reason: string,
    private readonly _cancelledAt: Date,
  ) {}

  public get reason() {
    return this._reason;
  }

  public get cancelledAt() {
    return this._cancelledAt;
  }
}
