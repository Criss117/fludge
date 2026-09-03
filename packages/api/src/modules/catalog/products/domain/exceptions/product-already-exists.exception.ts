import { ConflictError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class ProductAlreadyExistsException extends ConflictError {
  constructor(message?: TranslationKey) {
    super(message ?? "catalog.products.errors.already_exists");
  }
}
