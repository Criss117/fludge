import { NotFoundError } from "@fludge/api/core/shared/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class SaleNotFoundException extends NotFoundError {
  constructor(message: TranslationKey = "api_errors.sales.not_found") {
    super(message);
  }
}
