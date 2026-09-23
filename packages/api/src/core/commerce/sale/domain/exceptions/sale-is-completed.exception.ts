import { BadRequestError } from "@core/shared/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class SaleIsCompletedException extends BadRequestError {
  constructor(message: TranslationKey = "api_errors.sales.is_completed") {
    super(message);
  }
}
