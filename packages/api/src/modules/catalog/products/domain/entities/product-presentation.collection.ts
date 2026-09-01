import { ProductPresentationNoHasBarcodeException } from "../exceptions/product-bresentation-barcode-no-has-barcode.exception";
import { ProductPresentationAlreadyExistsException } from "../exceptions/product-presentation-already-exists.exception";
import { ProductPresentationNotFoundException } from "../exceptions/product-presentation-not-found.exception";
import type {
  ProductPresentation,
  UpdateProductPresentation,
} from "./product-presentation.entity";

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

  public checkUniquesForUpdate(
    id: string,
    data: Pick<UpdateProductPresentation, "name" | "barcode">,
  ) {
    return this.items.some(
      (item) => item.id.toString() !== id && item.checkUniquesData(data),
    );
  }

  public update(id: string, data: UpdateProductPresentation) {
    const item = this.get(id);

    if (!item) throw new ProductPresentationNotFoundException();

    if (this.checkUniquesForUpdate(id, data))
      throw new ProductPresentationAlreadyExistsException();

    item.update(data);

    this._items.set(item.id.toString(), item);

    if (this.barcodes.length === 0)
      throw new ProductPresentationNoHasBarcodeException(
        "Debe tener al menos una presentación con barcode",
      );

    return item;
  }

  public updateMany(
    updates: { id: string; data: UpdateProductPresentation }[],
  ): ProductPresentation[] {
    const updatesById = new Map(updates.map((u) => [u.id, u.data]));

    for (const { id } of updates) {
      if (!this._items.has(id))
        throw new ProductPresentationNotFoundException();
    }

    const projected = this.items.map((item) => {
      const data = updatesById.get(item.id.toString());
      const unique = data
        ? item.previewUniqueFields(data)
        : { name: item.values.name, barcode: item.barcode };

      return { id: item.id.toString(), ...unique };
    });

    for (const [i, a] of projected.entries()) {
      for (const b of projected.slice(i + 1)) {
        if (a.name === b.name)
          throw new ProductPresentationAlreadyExistsException();

        if (a.barcode !== null && a.barcode === b.barcode)
          throw new ProductPresentationAlreadyExistsException();
      }
    }

    return updates.map(({ id, data }) => {
      const item = this.get(id)!;
      item.update(data);
      this._items.set(id, item);
      return item;
    });
  }

  public get barcodes() {
    return this.items.map((p) => p.barcode).filter((b) => b !== null);
  }

  public remove(id: string) {
    if (!this._items.has(id)) throw new ProductPresentationNotFoundException();

    this._items.delete(id);
  }
}
