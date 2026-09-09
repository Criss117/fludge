import type { SaleStatusEnum } from "@fludge/utils/enums/db-enums";

export class SaleStatus {
  private readonly _value: SaleStatusEnum;

  constructor(value: SaleStatusEnum) {
    this._value = value;
  }

  public equals(status: SaleStatus) {
    return this._value === status._value;
  }

  public isOpen() {
    return this._value === "open";
  }

  public isCompleted() {
    return this._value === "completed";
  }

  public isCancelled() {
    return this._value === "cancelled";
  }

  public get value() {
    return this._value;
  }
}
