export class Slug {
  private readonly _value: string;

  constructor(value: string) {
    this._value = value
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  public toString() {
    return this._value;
  }

  public equals(other: Slug) {
    return this._value === other.toString();
  }
}
