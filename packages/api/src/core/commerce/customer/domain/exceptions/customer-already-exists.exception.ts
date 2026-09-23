import { ConflictError } from "../../../../shared/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class CustomerAlreadyExistsException extends ConflictError {
  constructor(
    message: TranslationKey = "api_errors.customers.document_taken",
  ) {
    super(message);
  }
}
