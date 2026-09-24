import { BadRequestError } from "@fludge/api/core/shared/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class CantDecreaseBalanceException extends BadRequestError {
  constructor(
    message: TranslationKey = "api_errors.customers.cant_decrease_balance",
  ) {
    super(message);
  }
}
