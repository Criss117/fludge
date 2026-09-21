import { NotFoundError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class CustomerNotFoundException extends NotFoundError {
  constructor(message: TranslationKey = "api_errors.customers.not_found") {
    super(message);
  }
}
