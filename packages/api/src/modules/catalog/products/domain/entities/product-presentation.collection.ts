import type { UUID } from "@fludge/utils/uuid";
import { DuplicatedBarcodeException } from "../exceptions/duplicated-barcode.exception";
import { ProductPresentationNoHasBarcodeException } from "../exceptions/product-bresentation-no-has-barcode.exception";
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

  public checkEquals(other: ProductPresentation, excludeId?: UUID) {
    const exists = this.items.some((item) => {
      if (excludeId && excludeId.toString() === item.id.toString())
        return false;

      return item.checkUniques(other);
    });

    if (exists) throw new ProductPresentationAlreadyExistsException();
  }

  public get(id: string) {
    return this._items.get(id);
  }

  public add(item: ProductPresentation) {
    if (this._items.has(item.id.toString()))
      throw new ProductPresentationAlreadyExistsException();

    this.checkEquals(item);

    this._items.set(item.id.toString(), item);

    this.checkBarcodes();

    return item;
  }

  public addMany(items: ProductPresentation[]) {
    return items.map((item) => this.add(item));
  }

  public update(id: string, data: UpdateProductPresentation) {
    const item = this._items.get(id);

    if (!item) throw new ProductPresentationNotFoundException();

    item.update(data);

    this._items.set(id, item);

    this.checkBarcodes();

    return item;
  }

  public updateMany(updates: (UpdateProductPresentation & { id: string })[]) {
    return updates.map((data) => this.update(data.id, data));
  }

  public checkBarcodes() {
    if (this.barcodes.length === 0)
      throw new ProductPresentationNoHasBarcodeException();

    const setBarcode = new Set(this.barcodes);

    if (setBarcode.size !== this.barcodes.length)
      throw new DuplicatedBarcodeException();
  }

  public get barcodes() {
    return this.items.map((p) => p.barcode).filter((b) => b !== null);
  }

  public delete(id: string) {
    if (!this._items.has(id)) throw new ProductPresentationNotFoundException();

    this._items.delete(id);
  }

  public deleteMany(ids: string[]) {
    ids.forEach((id) => this.delete(id));
  }
}
