import { BadRequestError } from "@fludge/api/core/shared/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class InvalidAmountException extends BadRequestError {
  constructor(message?: TranslationKey) {
    super(message ?? "api_errors.catalog.products.invalid_amount");
  }
}
