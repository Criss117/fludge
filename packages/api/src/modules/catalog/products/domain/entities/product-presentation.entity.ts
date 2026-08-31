import { UUID } from "@fludge/utils/uuid";
import { ProductStatus } from "../value-objects/product-status";
import { SearchName } from "@fludge/api/modules/shared/domain/value-objects/search-name";
import type { ProductPresentationSelect } from "@fludge/db/schema/catalog.schema";

export type CreateProductPresentation = {
  name: string;
  productName: string;
  barcode: string | null;
  conversionFactor: number;
  createdBy: string | null;
  organizationId: string;
  pricePurchase: number | null;
  priceSale: number;
  priceWholesale: number | null;
};

export class ProductPresentation {
  private constructor(
    private readonly _id: UUID,
    private readonly _organizationId: UUID,

    private _barcode: string | null,
    private _conversionFactor: number,
    private _name: string,
    private _searchName: SearchName,

    private _pricePurchase: number | null,
    private _priceSale: number,
    private _priceWholesale: number | null,

    private _status: ProductStatus,

    private _createdBy: UUID | null,
    private _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  public static create(data: CreateProductPresentation) {
    return new ProductPresentation(
      UUID.generate(),
      UUID.fromString(data.organizationId),
      data.barcode,
      data.conversionFactor,
      data.name,
      new SearchName(data.productName + " " + data.name),
      data.pricePurchase,
      data.priceSale,
      data.priceWholesale,
      new ProductStatus("active"),
      data.createdBy ? UUID.fromString(data.createdBy) : null,
      new Date(),
      new Date(),
    );
  }

  public static reconstitute(data: ProductPresentationSelect) {
    return new ProductPresentation(
      UUID.fromString(data.id),
      UUID.fromString(data.organizationId),
      data.barcode,
      data.conversionFactor,
      data.name,
      new SearchName(data.searchName),
      data.pricePurchase,
      data.priceSale,
      data.priceWholesale,
      new ProductStatus(data.status),
      data.createdBy ? UUID.fromString(data.createdBy) : null,
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

  public valuesWithProductId(productId: UUID): ProductPresentationSelect {
    return {
      ...this.values,
      productId: productId.toString(),
    };
  }

  public get values(): Omit<ProductPresentationSelect, "productId"> {
    return {
      id: this._id.toString(),
      organizationId: this._organizationId.toString(),
      barcode: this._barcode,
      conversionFactor: this._conversionFactor,
      name: this._name,
      searchName: this._searchName.value,
      pricePurchase: this._pricePurchase,
      priceSale: this._priceSale,
      priceWholesale: this._priceWholesale,
      status: this._status.value,
      createdBy: this._createdBy ? this._createdBy.toString() : null,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  public checkUniques(other: ProductPresentation) {
    return (
      (this._barcode !== null && this._barcode === other._barcode) ||
      this._name === other._name ||
      this._searchName.equals(other._searchName)
    );
  }
}
