export class SaleNumber {
  private readonly _prefix: string;
  private readonly _date: Date;
  private readonly _sequence: number;

  private constructor(
    sequence: number,
    prefix: string = "SL",
    date: Date = new Date(),
  ) {
    if (sequence < 1) {
      throw new Error("El correlativo de la venta debe ser mayor a 0");
    }

    this._prefix = prefix.toUpperCase().trim();
    this._sequence = sequence;
    this._date = date;
  }

  public static create(sequence: number, prefix: string = "SL"): SaleNumber {
    return new SaleNumber(sequence, prefix, new Date());
  }

  public static fromString(saleNumberStr: string): SaleNumber {
    const regex = /^([A-Z0-9]+)-(\d{8})-(\d+)$/;
    const match = saleNumberStr.match(regex);

    if (!match) {
      // Fallback si viene en un formato diferente o antiguo
      return new SaleNumber(1, saleNumberStr.split("-")[0] || "SL");
    }

    const [, prefix, dateStr, sequenceStr] = match;

    if (!prefix || !dateStr || !sequenceStr) {
      return new SaleNumber(1, saleNumberStr.split("-")[0] || "SL");
    }

    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1;
    const day = parseInt(dateStr.substring(6, 8), 10);
    const date = new Date(year, month, day);

    return new SaleNumber(parseInt(sequenceStr, 10), prefix, date);
  }

  public get prefix(): string {
    return this._prefix;
  }

  public get sequence(): number {
    return this._sequence;
  }

  public get date(): Date {
    return this._date;
  }

  /**
   * Genera el string formateado final (ej. "SL-20260908-00042")
   */
  public get value(): string {
    const year = this._date.getFullYear();
    const month = String(this._date.getMonth() + 1).padStart(2, "0");
    const day = String(this._date.getDate()).padStart(2, "0");
    const formattedSequence = String(this._sequence).padStart(5, "0");

    return `${this._prefix}-${year}${month}${day}-${formattedSequence}`;
  }
}
