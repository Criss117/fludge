import { DuplicatedSaleItemException } from "../exceptions/duplicated-sale-item.exception";
import { SaleItemNotFoundException } from "../exceptions/sale-item-not-found.exception";
import type { SaleItem } from "./sale-item.entity";

export class SaleItemCollection {
  private readonly _items: Map<string, SaleItem>;

  constructor(items: SaleItem[]) {
    this._items = new Map(items.map((item) => [item.id.toString(), item]));
  }

  public findByPresentationId(id: string) {
    let found: SaleItem | null = null;

    for (const item of this._items.values()) {
      if (item.presentation.id?.toString() === id) {
        found = item;
        break;
      }
    }

    return found;
  }

  public findById(id: string) {
    return this._items.get(id) ?? null;
  }

  public add(item: SaleItem) {
    const presentationId = item.presentation.id?.toString();

    if (!presentationId) {
      this._items.set(item.id.toString(), item);

      return;
    }

    const existing = this.findByPresentationId(presentationId);

    if (existing) throw new DuplicatedSaleItemException();

    this._items.set(item.id.toString(), item);
  }

  public update(values: SaleItem) {
    const existing = this.findById(values.id.toString());

    if (!existing) throw new SaleItemNotFoundException();

    this._items.set(values.id.toString(), values);
  }

  public delete(id: string) {
    const existing = this.findById(id);

    if (!existing) throw new SaleItemNotFoundException();

    this._items.delete(id);
  }

  public calculateTotal() {
    let total = 0;

    for (const item of this._items.values()) {
      total += item.values.subtotal;
    }

    return total;
  }

  public hasDuplicatedPresentations() {
    const presentationsIds: string[] = [];

    for (const item of this._items.values()) {
      const presentationId = item.presentation.id?.toString();

      if (!presentationId) continue;

      if (presentationsIds.includes(presentationId)) return true;

      presentationsIds.push(presentationId);
    }

    return false;
  }

  public get values() {
    return Array.from(this._items.values());
  }
}
