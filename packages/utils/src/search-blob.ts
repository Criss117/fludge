export class SearchBlob {
  private readonly _value: string;

  constructor(...texts: string[]) {
    if (!texts) throw new Error("SearchName must be defined");

    this._value = SearchBlob.normalize(texts.join(" "));
  }

  public static normalize(text: string) {
    if (!text) return "";

    return text
      .toLowerCase()
      .normalize("NFD") // Descompone caracteres (ej: 'á' -> 'a' + '\u0301')
      .replace(/[\u0300-\u036f]/g, "") // Remueve los signos diacríticos
      .replace(/[^a-z0-9\s]/g, "") // Elimina caracteres que no sean letras, números o espacios
      .replace(/\s+/g, " ") // Reduce múltiples espacios a uno solo
      .trim();
  }

  public get value() {
    return this._value;
  }

  public equals(other: SearchBlob) {
    return this._value === other._value;
  }
}
