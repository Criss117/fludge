import { ProductPresentationAlreadyExistsException } from "../exceptions/product-presentation-already-exists.exception";
import { ProductPresentationNotFoundException } from "../exceptions/product-presentation-not-found.exception";
import type { ProductPresentation } from "./product-presentation.entity";

export class ProductPresentationCollection {
  private constructor(
    private readonly _items: Map<string, ProductPresentation>,
  ) {}

  public static create(items: ProductPresentation[]) {
    return new ProductPresentationCollection(
      new Map(items.map((item) => [item.id.toString(), item])),
    );
  }

  public get items() {
    return Array.from(this._items.values());
  }

  public checkEquals(other: ProductPresentation) {
    return this.items.some((item) => item.checkUniques(other));
  }

  public get(id: string) {
    return this._items.get(id);
  }

  public add(item: ProductPresentation) {
    if (this._items.has(item.id.toString()))
      throw new ProductPresentationAlreadyExistsException();

    if (this.checkEquals(item))
      throw new ProductPresentationAlreadyExistsException();

    this._items.set(item.id.toString(), item);
  }

  public update(item: ProductPresentation) {
    if (!this._items.has(item.id.toString()))
      throw new ProductPresentationNotFoundException();

    this._items.set(item.id.toString(), item);
  }

  public remove(id: string) {
    if (!this._items.has(id)) throw new ProductPresentationNotFoundException();

    this._items.delete(id);
  }
}
