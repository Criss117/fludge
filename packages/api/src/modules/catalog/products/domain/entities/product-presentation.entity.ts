import { UUID } from "@fludge/utils/uuid";
import { ProductStatus } from "../value-objects/product-status";
import type { ProductPresentationSelect } from "@fludge/db/schema/catalog.schema";
import { SearchBlob } from "@fludge/utils/search-blob";
import type { ProductStatusEnum } from "@fludge/utils/enums/db-enums";

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

export type UpdateProductPresentation = Partial<
  Omit<CreateProductPresentation, "createdBy" | "organizationId">
> & {
  status?: ProductStatusEnum;
};

export class ProductPresentation {
  private constructor(
    private readonly _id: UUID,
    private readonly _organizationId: UUID,

    private _barcode: string | null,
    private _conversionFactor: number,
    private _name: string,
    private _searchBlob: SearchBlob,

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
      new SearchBlob(data.productName + " " + data.name),
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
      new SearchBlob(data.searchBlob),
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

  public update(data: UpdateProductPresentation) {
    if (data.name) {
      this._name = data.name;
      this._searchBlob = new SearchBlob(data.name);
    }

    if (data.barcode !== undefined) this._barcode = data.barcode;

    if (data.conversionFactor) this._conversionFactor = data.conversionFactor;

    if (data.pricePurchase) this._pricePurchase = data.pricePurchase;

    if (data.priceSale) this._priceSale = data.priceSale;

    if (data.priceWholesale !== undefined)
      this._priceWholesale = data.priceWholesale;

    if (data.status) this._status = new ProductStatus(data.status);

    this.touch();
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
      searchBlob: this._searchBlob.value,
      pricePurchase: this._pricePurchase,
      priceSale: this._priceSale,
      priceWholesale: this._priceWholesale,
      status: this._status.value,
      createdBy: this._createdBy ? this._createdBy.toString() : null,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  public previewUniqueFields(
    data: Pick<UpdateProductPresentation, "name" | "barcode">,
  ): { name: string; barcode: string | null } {
    return {
      name: data.name !== undefined ? data.name : this._name,
      barcode: data.barcode !== undefined ? data.barcode : this._barcode,
    };
  }

  public checkUniques(other: ProductPresentation) {
    return (
      (this._barcode !== null && this._barcode === other._barcode) ||
      this._name === other._name ||
      this._searchBlob.equals(other._searchBlob)
    );
  }

  public checkUniquesData(
    data: Pick<UpdateProductPresentation, "name" | "barcode">,
  ): boolean {
    if (data.name !== undefined && this._name === data.name) return true;
    if (
      data.barcode !== undefined &&
      data.barcode !== null &&
      this._barcode === data.barcode
    )
      return true;

    return false;
  }
}
