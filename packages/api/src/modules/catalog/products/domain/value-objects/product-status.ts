import type { ProductStatusEnum } from "@fludge/utils/enums/db-enums";

export class ProductStatus {
  private readonly _value: ProductStatusEnum;

  constructor(value: ProductStatusEnum) {
    this._value = value;
  }

  public equals(status: ProductStatus) {
    return this._value === status._value;
  }

  public isActive() {
    return this._value === "active";
  }

  public isInactive() {
    return this._value === "inactive";
  }

  public isDiscontinued() {
    return this._value === "discontinued";
  }

  public get value() {
    return this._value;
  }
}
