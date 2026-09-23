import { BadRequestError } from "@core/shared/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class PaymentAlreadyCancelledException extends BadRequestError {
  constructor(
    message: TranslationKey = "api_errors.customer_payments.already_cancelled",
  ) {
    super(message);
  }
}
