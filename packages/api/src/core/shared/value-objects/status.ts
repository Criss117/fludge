import type { StatusEnum } from "@fludge/utils/enums/db-enums";

export class Status {
  private readonly _value: StatusEnum;

  constructor(value: StatusEnum) {
    this._value = value;
  }

  static active() {
    return new Status("active");
  }

  static inactive() {
    return new Status("inactive");
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

  public toggle() {
    if (this.isActive()) return new Status("inactive");

    return new Status("active");
  }

  public get value() {
    return this._value;
  }
}
