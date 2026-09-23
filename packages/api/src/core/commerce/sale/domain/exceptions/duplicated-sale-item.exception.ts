import { BadRequestError } from "../../../../shared/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class DuplicatedSaleItemException extends BadRequestError {
  constructor(message?: TranslationKey) {
    super(message ?? "api_errors.sales.sale_items.duplicated");
  }
}
