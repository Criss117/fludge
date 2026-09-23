export type SaleItemSnapshotValue = {
  product: {
    id: string;
    name: string;
    slug: string;
  };
  presentation: {
    id: string;
    name: string;
    barcode: string | null;
    conversionFactor: number;
  };
};

/**
 * Fotografía inmutable del producto y su presentación al momento de la venta.
 *
 * Se persiste junto al item para que la venta conserve la identidad del
 * catálogo aunque el producto o la presentación cambien o se eliminen después.
 */
export class SaleItemSnapshot {
  constructor(private readonly _value: SaleItemSnapshotValue) {}

  public get value(): SaleItemSnapshotValue {
    return this._value;
  }

  public get productId(): string {
    return this._value.product.id;
  }

  public get presentationId(): string {
    return this._value.presentation.id;
  }
}
