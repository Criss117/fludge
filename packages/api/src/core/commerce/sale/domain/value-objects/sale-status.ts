import type { SaleStatusEnum } from "@fludge/utils/enums/db-enums";

const VALID_TRANSITIONS: Record<SaleStatusEnum, SaleStatusEnum[]> = {
  open: ["partial", "completed", "cancelled"],
  partial: ["completed", "open", "cancelled"],
  completed: ["open"],
  cancelled: [],
};

export class SaleStatus {
  private readonly _value: SaleStatusEnum;

  constructor(value: SaleStatusEnum) {
    this._value = value;
  }

  public static open(): SaleStatus {
    return new SaleStatus("open" as SaleStatusEnum);
  }

  public equals(status: SaleStatus) {
    return this._value === status._value;
  }

  public isOpen() {
    return this._value === "open";
  }

  public isPartial() {
    return this._value === "partial";
  }

  public isCompleted() {
    return this._value === "completed";
  }

  public isCancelled() {
    return this._value === "cancelled";
  }

  /** La venta acepta pagos cuando está abierta o parcial. */
  public isPayable() {
    return this._value === "open" || this._value === "partial";
  }

  public canTransitionTo(next: SaleStatusEnum): boolean {
    return VALID_TRANSITIONS[this._value].includes(next);
  }

  public transitionTo(next: SaleStatusEnum): SaleStatus {
    if (!this.canTransitionTo(next)) {
      throw new Error(
        `Invalid sale status transition: cannot go from "${this._value}" to "${next}"`,
      );
    }
    return new SaleStatus(next);
  }

  public complete(): SaleStatus {
    return this.transitionTo("completed" as SaleStatusEnum);
  }

  public cancel(): SaleStatus {
    return this.transitionTo("cancelled" as SaleStatusEnum);
  }

  public get value() {
    return this._value;
  }
}
