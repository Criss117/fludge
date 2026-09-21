import { BadRequestError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class PaymentExceedsBalanceException extends BadRequestError {
  constructor(
    message: TranslationKey = "api_errors.customer_payments.exceeds_balance",
  ) {
    super(message);
  }
}