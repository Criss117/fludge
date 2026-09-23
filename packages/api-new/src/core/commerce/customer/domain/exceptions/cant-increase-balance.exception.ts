import { BadRequestError } from "@core/shared/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class CantIncreaseBalanceException extends BadRequestError {
  constructor(
    message: TranslationKey = "api_errors.customers.credit_limit_exceeded",
  ) {
    super(message);
  }
}
