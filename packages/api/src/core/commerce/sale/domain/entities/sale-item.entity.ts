import { UUID } from "@fludge/utils/uuid";
import type { SaleItemSelect } from "@fludge/db/schema/sales.schema";
import {
  SaleItemSnapshot,
  type SaleItemSnapshotValue,
} from "../value-objects/sale-item-snapshot";
import { Status } from "@fludge/api/core/shared/value-objects/status";
import type { StatusEnum } from "@fludge/utils/enums/db-enums";

export interface CreateSaleItem {
  saleId: UUID;
  organizationId: UUID;
  productId: UUID | null;
  productPresentationId: UUID | null;
  productSnapshot: SaleItemSnapshotValue | null;
  name: string;
  unitPrice: number;
  quantity: number;
}

export type UpdateSaleItem = {
  quantity?: number;
  price?: number;
  status?: StatusEnum;
};

export class SaleItem {
  constructor(
    private readonly _id: UUID,
    private readonly _organizationId: UUID,
    private readonly _saleId: UUID,
    private readonly _productId: UUID | null,
    private readonly _productPresentationId: UUID | null,
    private _productSnapshot: SaleItemSnapshot | null,
    private _name: string,
    private _unitPrice: number,
    private _quantity: number,
    private _subtotal: number,
    private _updatedAt: Date,
    private readonly _createdAt: Date,
    private _status: Status,
  ) {}

  public static create(data: CreateSaleItem): SaleItem {
    const now = new Date();
    const subtotal = data.unitPrice * data.quantity;

    return new SaleItem(
      UUID.generate(),
      data.organizationId,
      data.saleId,
      data.productId,
      data.productPresentationId,
      data.productSnapshot ? new SaleItemSnapshot(data.productSnapshot) : null,
      data.name,
      data.unitPrice,
      data.quantity,
      subtotal,
      now,
      now,
      new Status("active"),
    );
  }

  public static reconstitute(data: SaleItemSelect): SaleItem {
    return new SaleItem(
      UUID.fromString(data.id),
      UUID.fromString(data.organizationId),
      UUID.fromString(data.saleId),
      data.productId ? UUID.fromString(data.productId) : null,
      data.productPresentationId
        ? UUID.fromString(data.productPresentationId)
        : null,
      data.productSnapshot ? new SaleItemSnapshot(data.productSnapshot) : null,
      data.name,
      data.unitPrice,
      data.quantity,
      data.subtotal,
      new Date(data.updatedAt),
      new Date(data.createdAt),
      new Status(data.status),
    );
  }

  public touch() {
    this._updatedAt = new Date();
  }

  public update(data: UpdateSaleItem) {
    if (data.quantity !== undefined && data.quantity > 0)
      this._quantity = data.quantity;

    if (data.price !== undefined && data.price > 0)
      this._unitPrice = data.price;

    if (data.status !== undefined) this._status = new Status(data.status);

    this.touch();
  }

  public get id(): UUID {
    return this._id;
  }

  public get saleId(): UUID {
    return this._saleId;
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

  public get status(): Status {
    return this._status;
  }

  public get values(): SaleItemSelect {
    return {
      id: this._id.toString(),
      organizationId: this._organizationId.toString(),
      saleId: this._saleId.toString(),
      productId: this._productId?.toString() ?? null,
      productPresentationId: this._productPresentationId?.toString() ?? null,
      productSnapshot: this._productSnapshot?.value ?? null,
      name: this._name,
      unitPrice: this._unitPrice,
      quantity: this._quantity,
      subtotal: this._subtotal,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      status: this._status.value,
    };
  }
}
