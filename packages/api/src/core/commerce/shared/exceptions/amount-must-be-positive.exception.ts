import { BadRequestError } from "@fludge/api/core/shared/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class AmountMustBePositiveException extends BadRequestError {
  constructor(message: TranslationKey = "api_errors.shared.amount_must_be_positive") {
    super(message);
  }
}
