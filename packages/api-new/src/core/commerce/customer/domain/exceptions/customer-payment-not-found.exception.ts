import { NotFoundError } from "@core/shared/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class CustomerPaymentNotFoundException extends NotFoundError {
  constructor(
    message: TranslationKey = "api_errors.customer_payments.not_found",
  ) {
    super(message);
  }
}
