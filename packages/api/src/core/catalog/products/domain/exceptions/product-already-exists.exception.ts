import { ConflictError } from "../../../../shared/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class ProductAlreadyExistsException extends ConflictError {
  constructor(message?: TranslationKey) {
    super(message ?? "api_errors.catalog.products.already_exists");
  }
}