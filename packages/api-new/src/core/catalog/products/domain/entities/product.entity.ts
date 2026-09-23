import { UUID } from "@fludge/utils/uuid";
import { ProductStatus } from "../value-objects/product-status";
import { SearchBlob } from "@fludge/utils/search-blob";
import type {
  ProductPresentationSelect,
  ProductSelect,
} from "@fludge/db/schema/catalog.schema";
import { Slug } from "@fludge/utils/slugify";
import {
  type CreateProductPresentation,
  ProductPresentation,
  type UpdateProductPresentation,
} from "./product-presentation.entity";
import { ProductPresentationCollection } from "./product-presentation.collection";
import { ProductPresentationNoHasBarcodeException } from "../exceptions/product-presentation-no-has-barcode.exception";
import { ProductStock } from "../value-objects/product-stock";
import { DuplicatedBarcodeException } from "../exceptions/duplicated-barcode.exception";
import { InvalidAmountException } from "../exceptions/invalid-amount.exception";
import type { ProductStatusEnum } from "@fludge/utils/enums/db-enums";

type CreateProduct = {
  name: string;
  categoryId?: string | null;
  description: string;
  stock: number;
  allowNegativeStock: boolean;
  minStock: number;
  createdBy: string;
  organizationId: string;

  presentations: CreateProductPresentation[];
};

type UpdateProduct = Partial<
  Omit<CreateProduct, "presentations" | "createdBy" | "organizationId">
> & {
  status?: ProductStatusEnum;
};

type SaleProduct = {
  id: string;
  quantity: number;
};

type RefundProduct = {
  presentationId: string;
  quantity: number;
  conversionFactor: number;
};

export class Product {
  private constructor(
    private readonly _id: UUID,
    private readonly _organizationId: UUID,
    private _categoryId: UUID | null,

    private _name: string,
    private _searchBlob: SearchBlob,
    private _slug: Slug,
    private _description: string,

    private _stock: ProductStock,

    private _status: ProductStatus,

    private _createdBy: UUID,
    private _createdAt: Date,
    private _updatedAt: Date,

    private _presentations: ProductPresentationCollection,
  ) {}

  public static create(data: CreateProduct) {
    const somePresentationHasBarcode = data.presentations.some(
      (item) => item.barcode && item.barcode.length > 0,
    );

    if (!somePresentationHasBarcode)
      throw new ProductPresentationNoHasBarcodeException();

    const allBarcodes = data.presentations
      .map((item) => item.barcode)
      .filter((b) => b !== null);

    const setBarcode = new Set(allBarcodes);

    if (setBarcode.size !== allBarcodes.length)
      throw new DuplicatedBarcodeException();

    const newProduct = new Product(
      UUID.generate(),
      UUID.fromString(data.organizationId),
      data.categoryId && data.categoryId.length > 0
        ? UUID.fromString(data.categoryId)
        : null,
      data.name,
      new SearchBlob(data.name),
      new Slug(data.name),
      data.description,
      new ProductStock(data.stock, data.minStock, data.allowNegativeStock),
      new ProductStatus("active"),
      UUID.fromString(data.createdBy),
      new Date(),
      new Date(),
      ProductPresentationCollection.create(
        data.presentations.map((item) => ProductPresentation.create(item)),
      ),
    );

    newProduct._searchBlob = newProduct.buildSearchBlob();

    newProduct.presentationsCollection.checkBarcodes();

    return newProduct;
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
      new SearchBlob(data.searchBlob),
      new Slug(data.slug),
      data.description,
      new ProductStock(data.stock, data.minStock, data.allowNegativeStock),
      new ProductStatus(data.status),
      UUID.fromString(data.createdBy),
      new Date(data.createdAt),
      new Date(data.updatedAt),
      ProductPresentationCollection.create(
        data.presentations.map((item) =>
          ProductPresentation.reconstitute(item),
        ),
      ),
    );
  }

  private buildSearchBlob(): SearchBlob {
    return new SearchBlob(this._name, ...this.barcodes);
  }

  public touch() {
    this._updatedAt = new Date();
  }

  public update(data: UpdateProduct) {
    if (data.name) {
      this._name = data.name;
      this._searchBlob = this.buildSearchBlob();
      this._slug = new Slug(data.name);
    }

    if (data.description !== undefined) this._description = data.description;

    if (data.status) this._status = new ProductStatus(data.status);

    if (data.categoryId !== undefined && data.categoryId !== "")
      this._categoryId = data.categoryId
        ? UUID.fromString(data.categoryId)
        : null;

    if (
      data.allowNegativeStock !== undefined ||
      data.stock !== undefined ||
      data.minStock !== undefined
    ) {
      this._stock = new ProductStock(
        data.stock ?? this._stock.stock,
        data.minStock ?? this._stock.minStock,
        data.allowNegativeStock !== undefined
          ? data.allowNegativeStock
          : this._stock.allowNegativeStock,
      );
    }

    this.touch();
  }

  public get id(): UUID {
    return this._id;
  }

  public get presentations(): readonly ProductPresentation[] {
    return this._presentations.items;
  }

  public savePresentations(
    data: Array<UpdateProductPresentation & { id: string }>,
  ) {
    for (const item of data) {
      const existing = this._presentations.get(item.id);

      if (!existing) {
        const newItem = ProductPresentation.create({
          conversionFactor: item.conversionFactor,
          name: item.name,
          productName: this._name,
          pricePurchase: item.pricePurchase,
          priceSale: item.priceSale,
          priceWholesale: item.priceWholesale,
          organizationId: this._organizationId.toString(),
          createdBy: item.createdBy ?? this._createdBy.toString(),
          barcode: item.barcode,
        });

        this._presentations.add(newItem);
        continue;
      }

      existing.update({
        conversionFactor: item.conversionFactor,
        name: item.name,
        productName: this._name,
        pricePurchase: item.pricePurchase,
        priceSale: item.priceSale,
        priceWholesale: item.priceWholesale,
        status: item.status,
        barcode: item.barcode,
      });

      this._presentations.update(existing);
    }

    this._presentations.checkBarcodes();
    this._searchBlob = this.buildSearchBlob();
    this.touch();
  }

  public deletePresentations(ids: string[]) {
    this._presentations.deleteMany(ids);
    this._searchBlob = this.buildSearchBlob();
    this.touch();
  }

  public sale(presentation: SaleProduct | SaleProduct[]) {
    const presentations = Array.isArray(presentation)
      ? presentation
      : [presentation];

    for (const item of presentations) {
      if (item.quantity < 0)
        throw new InvalidAmountException(
          "api_errors.catalog.products.amount_must_be_positive",
        );
    }

    const totalQuantity = presentations.reduce((acc, sale) => {
      const existing = this._presentations.get(sale.id);

      if (!existing) return acc;

      const conversionFactor = existing.values.conversionFactor;

      return acc + sale.quantity * conversionFactor;
    }, 0);

    this._stock = this._stock.decreaseStock(totalQuantity);
    this.touch();
  }

  public refund(presentation: RefundProduct | RefundProduct[]) {
    const presentations = Array.isArray(presentation)
      ? presentation
      : [presentation];

    for (const item of presentations) {
      if (item.quantity < 0)
        throw new InvalidAmountException(
          "api_errors.catalog.products.amount_must_be_positive",
        );
    }

    const totalQuantity = presentations.reduce((acc, item) => {
      const existing = this._presentations.get(item.presentationId);

      if (!existing) return acc;

      return acc + item.quantity * item.conversionFactor;
    }, 0);

    this._stock = this._stock.increaseStock(totalQuantity);
    this.touch();
  }

  public get presentationsCollection() {
    return this._presentations;
  }

  public get barcodes() {
    return this._presentations.barcodes;
  }

  public get values(): ProductSelect & {
    presentations: ProductPresentationSelect[];
  } {
    return {
      id: this._id.toString(),
      organizationId: this._organizationId.toString(),
      categoryId: this._categoryId ? this._categoryId.toString() : null,
      name: this._name,
      searchBlob: this._searchBlob.value,
      slug: this._slug.toString(),
      description: this._description,
      status: this._status.value,
      createdBy: this._createdBy.toString(),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      presentations: this._presentations.items.map((item) =>
        item.valuesWithProductId(this._id),
      ),
      ...this._stock.values,
    };
  }
}