import { DuplicatedSaleItemException } from "../exceptions/duplicated-sale-item.exception";
import { SaleItemNotFoundException } from "../exceptions/sale-item-not-found.exception";
import type { SaleItem } from "./sale-item.entity";

export class SaleItemCollection {
  private readonly _items: Map<string, SaleItem>;

  constructor(items: SaleItem[]) {
    this._items = new Map(items.map((item) => [item.id.toString(), item]));
  }

  public exists(id: string | string[]) {
    if (Array.isArray(id)) {
      return id.every((i) => this._items.has(i));
    }

    return this._items.has(id);
  }

  public findByPresentationId(id: string) {
    let found: SaleItem | null = null;

    for (const item of this._items.values()) {
      if (item.presentationId?.toString() === id) {
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
    const presentationId = item.presentationId?.toString();

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
      const presentationId = item.presentationId?.toString();

      if (!presentationId) continue;

      if (presentationsIds.includes(presentationId)) return true;

      presentationsIds.push(presentationId);
    }

    return false;
  }

  public getProductIdsByItemIds(itemId: string | string[]) {
    const itemIds = Array.isArray(itemId) ? itemId : [itemId];

    const items: SaleItem[] = [];

    for (const id of itemIds) {
      const item = this._items.get(id);

      if (!item) continue;

      items.push(item);
    }

    if (items.length !== itemIds.length) throw new SaleItemNotFoundException();

    const productIds: Set<string> = new Set();

    for (const item of items) {
      if (item.productId) productIds.add(item.productId.toString());
    }

    return Array.from(productIds);
  }

  public get productIds() {
    const productIds: Set<string> = new Set();

    for (const item of this._items.values()) {
      if (item.productId) productIds.add(item.productId.toString());
    }

    return Array.from(productIds);
  }

  public get values() {
    return Array.from(this._items.values());
  }
}
