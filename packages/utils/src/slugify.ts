export class Slug {
  private readonly _value: string;

  constructor(value: string) {
    this._value = value
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .trim();
  }

  public toString() {
    return this._value;
  }

  public equals(other: Slug) {
    return this._value === other.toString();
  }
}
