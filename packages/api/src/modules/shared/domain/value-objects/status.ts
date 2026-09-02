import type { StatusEnum } from "@fludge/utils/enums/db-enums";

export class Status {
  private readonly _value: StatusEnum;

  constructor(value: StatusEnum) {
    this._value = value;
  }

  public equals(status: Status) {
    return this._value === status._value;
  }

  public isActive() {
    return this._value === "active";
  }

  public isInactive() {
    return this._value === "inactive";
  }

  public get value() {
    return this._value;
  }
}
