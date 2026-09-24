import { UUID } from "@fludge/utils/uuid";
import { ProductStatus } from "../value-objects/product-status";
import type { ProductPresentationSelect } from "@fludge/db/schema/catalog.schema";
import type { ProductStatusEnum } from "@fludge/utils/enums/db-enums";

export type CreateProductPresentation = {
  name: string;
  barcode?: string | null;
  conversionFactor: number;
  createdBy: UUID;
  organizationId: UUID;
  pricePurchase?: number | null;
  priceSale: number;
  priceWholesale?: number | null;
  productId: UUID;
};

export type UpdateProductPresentation = {
  name: string;
  barcode?: string | null;
  conversionFactor: number;
  pricePurchase?: number | null;
  priceSale: number;
  priceWholesale?: number | null;
  status: ProductStatusEnum;
};

export class ProductPresentation {
  private constructor(
    private readonly _id: UUID,
    private readonly _organizationId: UUID,
    private readonly _productId: UUID,

    private _barcode: string | null,
    private _conversionFactor: number,
    private _name: string,

    private _pricePurchase: number | null,
    private _priceSale: number,
    private _priceWholesale: number | null,

    private _status: ProductStatus,

    private _createdBy: UUID,
    private _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  public static create(data: CreateProductPresentation) {
    return new ProductPresentation(
      UUID.generate(),
      data.organizationId,
      data.productId,
      data.barcode ?? null,
      data.conversionFactor,
      data.name,
      data.pricePurchase ?? null,
      data.priceSale,
      data.priceWholesale ?? null,
      new ProductStatus("active"),
      data.createdBy,
      new Date(),
      new Date(),
    );
  }

  public static reconstitute(data: ProductPresentationSelect) {
    return new ProductPresentation(
      UUID.fromString(data.id),
      UUID.fromString(data.organizationId),
      UUID.fromString(data.productId),
      data.barcode,
      data.conversionFactor,
      data.name,
      data.pricePurchase,
      data.priceSale,
      data.priceWholesale,
      new ProductStatus(data.status),
      UUID.fromString(data.createdBy),
      new Date(data.createdAt),
      new Date(data.updatedAt),
    );
  }

  public touch() {
    this._updatedAt = new Date();
  }

  public get id() {
    return this._id;
  }

  public get barcode() {
    return this._barcode;
  }

  public update(data: UpdateProductPresentation) {
    if (data.name) {
      this._name = data.name;
    }

    if (data.barcode !== undefined) this._barcode = data.barcode;

    if (data.conversionFactor !== undefined)
      this._conversionFactor = data.conversionFactor;

    if (data.pricePurchase !== undefined)
      this._pricePurchase = data.pricePurchase;

    if (data.priceSale !== undefined) this._priceSale = data.priceSale;

    if (data.priceWholesale !== undefined)
      this._priceWholesale = data.priceWholesale;

    if (data.status) this._status = new ProductStatus(data.status);

    this.touch();
  }

  public get values(): ProductPresentationSelect {
    return {
      id: this._id.toString(),
      organizationId: this._organizationId.toString(),
      productId: this._productId.toString(),
      barcode: this._barcode,
      conversionFactor: this._conversionFactor,
      name: this._name,
      pricePurchase: this._pricePurchase,
      priceSale: this._priceSale,
      priceWholesale: this._priceWholesale,
      status: this._status.value,
      createdBy: this._createdBy.toString(),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
