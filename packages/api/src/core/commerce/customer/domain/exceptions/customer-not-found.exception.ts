import { NotFoundError } from "../../../../shared/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class CustomerNotFoundException extends NotFoundError {
  constructor(message: TranslationKey = "api_errors.customers.not_found") {
    super(message);
  }
}
