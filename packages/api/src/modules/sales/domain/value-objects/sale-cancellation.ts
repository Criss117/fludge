export class SaleCancellation {
  constructor(
    private readonly _reason: string | null,
    private readonly _cancelledAt: Date | null,
  ) {}

  public get reason(): string | null {
    return this._reason;
  }

  public get cancelledAt(): Date | null {
    return this._cancelledAt;
  }

  public get value() {
    return {
      reason: this._reason,
      cancelledAt: this._cancelledAt,
    };
  }
}
