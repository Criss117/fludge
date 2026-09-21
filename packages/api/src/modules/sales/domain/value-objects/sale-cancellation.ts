export class SaleCancellation {
  constructor(
    private readonly _reason: string,
    private readonly _cancelledAt: Date,
  ) {}

  public get reason(): string {
    return this._reason;
  }

  public get cancelledAt(): Date {
    return this._cancelledAt;
  }

  public get value() {
    return {
      reason: this._reason,
      cancelledAt: this._cancelledAt,
    };
  }
}
