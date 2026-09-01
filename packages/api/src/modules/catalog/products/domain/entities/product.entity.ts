import { UUID } from "@fludge/utils/uuid";
import { ProductStatus } from "../value-objects/product-status";
import { SearchName } from "@fludge/api/modules/shared/domain/value-objects/search-name";
import type {
  ProductPresentationSelect,
  ProductSelect,
} from "@fludge/db/schema/catalog.schema";
import { Slug } from "@fludge/utils/slugify";
import {
  type CreateProductPresentation,
  ProductPresentation,
} from "./product-presentation.entity";
import { ProductPresentationCollection } from "./product-presentation.collection";
import { ProductPresentationNoHasBarcodeException } from "../exceptions/product-bresentation-barcode-no-has-barcode.exception";
import { ProductStock } from "../value-objects/product-stock";
import { DuplicatedBarcodeException } from "../exceptions/duplicated-barcode.exception";
import type { ProductStatusEnum } from "@fludge/db/schema/enums";

type CreateProduct = {
  name: string;
  categoryId: string | null;
  description: string | null;
  stock: number;
  allowNegativeStock: boolean;
  minStock: number;
  createdBy: string | null;
  organizationId: string;

  presentations: CreateProductPresentation[];
};

type UpdateProduct = Partial<
  Omit<CreateProduct, "presentations" | "createdBy" | "organizationId">
> & {
  status?: ProductStatusEnum;
};

export class Product {
  private constructor(
    private readonly _id: UUID,
    private readonly _organizationId: UUID,
    private _categoryId: UUID | null,

    private _name: string,
    private _searchName: SearchName,
    private _slug: Slug,
    private _description: string | null,

    private _stock: ProductStock,

    private _status: ProductStatus,

    private _createdBy: UUID | null,
    private _createdAt: Date,
    private _updatedAt: Date,

    private _presentations: ProductPresentationCollection,
  ) {}

  public static create(data: CreateProduct) {
    const somePresentationHasBarcode = data.presentations.some(
      (item) => item.barcode !== null && item.barcode.length > 0,
    );

    if (!somePresentationHasBarcode)
      throw new ProductPresentationNoHasBarcodeException();

    const allBarcodes = data.presentations
      .map((item) => item.barcode)
      .filter((b) => b !== null);

    const setBarcode = new Set(allBarcodes);

    if (setBarcode.size !== allBarcodes.length)
      throw new DuplicatedBarcodeException("El barcode debe ser único");

    return new Product(
      UUID.generate(),
      UUID.fromString(data.organizationId),
      data.categoryId ? UUID.fromString(data.categoryId) : null,
      data.name,
      new SearchName(data.name),
      new Slug(data.name),
      data.description,
      new ProductStock(data.stock, data.minStock, data.allowNegativeStock),
      new ProductStatus("active"),
      data.createdBy ? UUID.fromString(data.createdBy) : null,
      new Date(),
      new Date(),
      ProductPresentationCollection.create(
        data.presentations.map((item) => ProductPresentation.create(item)),
      ),
    );
  }

  public static reconstitute(
    data: ProductSelect & {
      presentations: ProductPresentationSelect[];
    },
  ) {
    return new Product(
      UUID.fromString(data.id),
      UUID.fromString(data.organizationId),
      data.categoryId ? UUID.fromString(data.categoryId) : null,
      data.name,
      new SearchName(data.searchName),
      new Slug(data.slug),
      data.description,
      new ProductStock(data.stock, data.minStock, data.allowNegativeStock),
      new ProductStatus(data.status),
      data.createdBy ? UUID.fromString(data.createdBy) : null,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      ProductPresentationCollection.create(
        data.presentations.map((item) =>
          ProductPresentation.reconstitute(item),
        ),
      ),
    );
  }

  public touch() {
    this._updatedAt = new Date();
  }

  public update(data: UpdateProduct) {
    if (data.name) {
      this._name = data.name;
      this._searchName = new SearchName(data.name);
      this._slug = new Slug(data.name);
    }

    if (data.description) this._description = data.description;

    if (data.status) this._status = new ProductStatus(data.status);

    if (data.categoryId !== undefined)
      this._categoryId = data.categoryId
        ? UUID.fromString(data.categoryId)
        : null;

    if (data.allowNegativeStock || data.stock || data.minStock) {
      this._stock = new ProductStock(
        data.stock ?? this._stock.stock,
        data.minStock ?? this._stock.minStock,
        data.allowNegativeStock ?? this._stock.allowNegativeStock,
      );
    }

    this.touch();
  }

  public get id(): UUID {
    return this._id;
  }

  public get presentations() {
    return this._presentations;
  }

  public get values(): ProductSelect & {
    presentations: ProductPresentationSelect[];
  } {
    return {
      id: this._id.toString(),
      organizationId: this._organizationId.toString(),
      categoryId: this._categoryId ? this._categoryId.toString() : null,
      name: this._name,
      searchName: this._searchName.value,
      slug: this._slug.toString(),
      description: this._description,
      status: this._status.value,
      createdBy: this._createdBy ? this._createdBy.toString() : null,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      presentations: this._presentations.items.map((item) =>
        item.valuesWithProductId(this._id),
      ),
      ...this._stock.values,
    };
  }
}
