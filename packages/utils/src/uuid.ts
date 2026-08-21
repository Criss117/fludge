import { v7 as uuidv7 } from "uuid";

export class UUID {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static generate() {
    return new UUID(uuidv7());
  }

  public static fromString(value: string) {
    return new UUID(value);
  }

  public toString() {
    return this._value;
  }

  public equals(other: UUID) {
    return this._value === other.toString();
  }
}
