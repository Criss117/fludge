import { InsufficientStockException } from "../exceptions/insufficient-stock.exception";
import { InvalidAmountException } from "../exceptions/invalid-amount.exception";
import { InvalidMinStockException } from "../exceptions/invalid-min-stock.exception";
import { MinStockMustBeLowerThanStockException } from "../exceptions/min-stock-must-be-lower-than-stock.exception";
import { StockMustBePositiveException } from "../exceptions/stock-must-be-positive.exception";

export class ProductStock {
  private _stock: number;
  private _minStock: number;
  private _allowNegativeStock: boolean;

  constructor(stock: number, minStock: number, allowNegativeStock: boolean) {
    if (!allowNegativeStock) {
      if (stock < 0) throw new StockMustBePositiveException();

      if (minStock > stock) throw new MinStockMustBeLowerThanStockException();
    }

    this._stock = stock;
    this._minStock = minStock;
    this._allowNegativeStock = allowNegativeStock;
    Object.freeze(this);
  }

  public toggleAllowNegativeStock() {
    return new ProductStock(
      this._stock,
      this._minStock,
      !this._allowNegativeStock,
    );
  }

  public increaseStock(amount: number) {
    if (amount < 0)
      throw new InvalidAmountException(
        "api_errors.catalog.products.amount_must_be_positive",
      );

    return new ProductStock(
      this._stock + amount,
      this._minStock,
      this._allowNegativeStock,
    );
  }

  public decreaseStock(amount: number) {
    if (amount < 0)
      throw new InvalidAmountException(
        "api_errors.catalog.products.amount_must_be_positive",
      );

    if (!this._allowNegativeStock && this._stock - amount < 0)
      throw new InsufficientStockException();

    return new ProductStock(
      this._stock - amount,
      this._minStock,
      this._allowNegativeStock,
    );
  }

  public updateMinStock(newMinStock: number): ProductStock {
    if (newMinStock < 0) throw new InvalidMinStockException();

    return new ProductStock(this._stock, newMinStock, this._allowNegativeStock);
  }

  public get stock() {
    return this._stock;
  }

  public get minStock() {
    return this._minStock;
  }

  public get allowNegativeStock() {
    return this._allowNegativeStock;
  }

  public get values() {
    return {
      stock: this._stock,
      minStock: this._minStock,
      allowNegativeStock: this._allowNegativeStock,
    };
  }
}
