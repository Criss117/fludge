import { NotFoundError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class SalePaymentNotFoundException extends NotFoundError {
  constructor(message: TranslationKey = "api_errors.sales.payments.not_found") {
    super(message);
  }
}
