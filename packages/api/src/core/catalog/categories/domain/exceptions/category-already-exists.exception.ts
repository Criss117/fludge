import { ConflictError } from "@fludge/api/core/shared/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class CategoryAlreadyExistsException extends ConflictError {
  constructor(message?: TranslationKey) {
    super(message ?? "api_errors.catalog.categories.already_exists");
  }
}
