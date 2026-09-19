import { UUID } from "@fludge/utils/uuid";
import type { SaleItemSelect } from "@fludge/db/schema/sales.schema";
import {
  SaleItemSnapshot,
  type SaleItemSnapshotValue,
} from "../value-objects/sale-item-snapshot";

export interface CreateSaleItem {
  organizationId: UUID;
  productId: UUID | null;
  productPresentationId: UUID | null;
  productSnapshot: SaleItemSnapshotValue | null;
  name: string;
  unitPrice: number;
  quantity: number;
}

export class SaleItem {
  constructor(
    private readonly _id: UUID,
    private readonly _organizationId: UUID,
    private readonly _productId: UUID | null,
    private readonly _productPresentationId: UUID | null,
    private _productSnapshot: SaleItemSnapshot | null,
    private _name: string,
    private _unitPrice: number,
    private _quantity: number,
    private _subtotal: number,
    private _updatedAt: Date,
    private readonly _createdAt: Date,
  ) {}

  public static create(data: CreateSaleItem): SaleItem {
    const now = new Date();
    const subtotal = data.unitPrice * data.quantity;

    return new SaleItem(
      UUID.generate(),
      data.organizationId,
      data.productId,
      data.productPresentationId,
      data.productSnapshot
        ? new SaleItemSnapshot(data.productSnapshot)
        : null,
      data.name,
      data.unitPrice,
      data.quantity,
      subtotal,
      now,
      now,
    );
  }

  public static reconstitute(data: SaleItemSelect): SaleItem {
    return new SaleItem(
      UUID.fromString(data.id),
      UUID.fromString(data.organizationId),
      data.productId ? UUID.fromString(data.productId) : null,
      data.productPresentationId
        ? UUID.fromString(data.productPresentationId)
        : null,
      data.productSnapshot
        ? new SaleItemSnapshot(data.productSnapshot)
        : null,
      data.name,
      data.unitPrice,
      data.quantity,
      data.subtotal,
      new Date(data.updatedAt),
      new Date(data.createdAt),
    );
  }

  public get id(): UUID {
    return this._id;
  }

  public get productId(): UUID | null {
    return this._productId;
  }

  public get presentationId(): UUID | null {
    return this._productPresentationId;
  }

  public get productSnapshot(): SaleItemSnapshot | null {
    return this._productSnapshot;
  }

  public get values(): Omit<SaleItemSelect, "saleId"> {
    return {
      id: this._id.toString(),
      organizationId: this._organizationId.toString(),
      productId: this._productId?.toString() ?? null,
      productPresentationId: this._productPresentationId?.toString() ?? null,
      productSnapshot: this._productSnapshot?.value ?? null,
      name: this._name,
      unitPrice: this._unitPrice,
      quantity: this._quantity,
      subtotal: this._subtotal,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      status: "active",
    };
  }
}
