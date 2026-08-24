import type { RoleEnum } from "@fludge/db/schema/enums";

export class Role {
  private readonly _value: RoleEnum;

  constructor(value: RoleEnum) {
    this._value = value;
  }

  public equals(role: RoleEnum) {
    return this._value === role;
  }

  public isOwner() {
    return this._value === "owner";
  }

  public isMember() {
    return this._value === "member";
  }

  public get value() {
    return this._value;
  }
}
