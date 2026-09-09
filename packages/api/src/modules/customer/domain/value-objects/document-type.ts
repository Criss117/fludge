import type { CustomerDocumentTypeEnum } from "@fludge/utils/enums/db-enums";

export class CustomerDocument {
  constructor(
    private readonly _type: CustomerDocumentTypeEnum,
    private readonly _number: string,
  ) {}

  public get value() {
    return {
      type: this._type,
      number: this._number,
    };
  }
}
