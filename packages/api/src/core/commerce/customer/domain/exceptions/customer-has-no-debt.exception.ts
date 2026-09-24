import { BadRequestError } from "@fludge/api/core/shared/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class CustomerHasNoDebtException extends BadRequestError {
  constructor(
    message: TranslationKey = "api_errors.customer_payments.no_debt",
  ) {
    super(message);
  }
}
