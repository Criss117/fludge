import type { UUID } from "@fludge/utils/uuid";

export class ProductPresentationSnapshot {
  constructor(
    private readonly _id: UUID | null,
    private readonly _name: string,
    private readonly _price: number,
  ) {}

  public get id(): UUID | null {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get price(): number {
    return this._price;
  }

  public get value() {
    return {
      id: this._id?.toString() ?? null,
      name: this._name,
      price: this._price,
    };
  }
}
