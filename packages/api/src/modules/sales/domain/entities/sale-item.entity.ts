import { UUID } from "@fludge/utils/uuid";
import { ProductPresentationSnapshot } from "../value-objects/product-presentation-snapshot";
import type { SaleItemSelect } from "@fludge/db/schema/sales.schema";

export interface CreateSaleItem {
  organizationId: UUID;
  productPresentation: {
    id: UUID | null;
    name: string;
    price: number;
  };
  quantity: number;
}

export class SaleItem {
  constructor(
    private readonly _id: UUID,
    private readonly _organizationId: UUID,
    private _productPresentation: ProductPresentationSnapshot,
    private _quantity: number,
    private _subtotal: number,
    private _updatedAt: Date,
    private readonly _createdAt: Date,
  ) {}

  public static create(data: CreateSaleItem): SaleItem {
    const now = new Date();
    const subtotal = data.productPresentation.price * data.quantity;

    const productSnapshot = new ProductPresentationSnapshot(
      data.productPresentation.id,
      data.productPresentation.name,
      data.productPresentation.price,
    );

    return new SaleItem(
      UUID.generate(),
      data.organizationId,
      productSnapshot,
      data.quantity,
      subtotal,
      now,
      now,
    );
  }

  public static reconstitute(data: SaleItemSelect): SaleItem {
    const productSnapshot = new ProductPresentationSnapshot(
      data.productPresentationId
        ? UUID.fromString(data.productPresentationId)
        : null,
      data.productPresentationName,
      data.productPresentationPrice,
    );

    return new SaleItem(
      UUID.fromString(data.id),
      UUID.fromString(data.organizationId),
      productSnapshot,
      data.quantity,
      data.subtotal,
      new Date(data.updatedAt),
      new Date(data.createdAt),
    );
  }

  public get id(): UUID {
    return this._id;
  }

  public get presentation() {
    return this._productPresentation;
  }

  public get values(): Omit<SaleItemSelect, "saleId"> {
    const product = this._productPresentation.value;

    return {
      id: this._id.toString(),
      organizationId: this._organizationId.toString(),
      productPresentationId: product.id,
      productPresentationName: product.name,
      productPresentationPrice: product.price,
      quantity: this._quantity,
      subtotal: this._subtotal,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
