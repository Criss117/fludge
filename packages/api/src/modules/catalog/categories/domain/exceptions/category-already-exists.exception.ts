import { ConflictError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class CategoryAlreadyExistsException extends ConflictError {
  constructor(message?: TranslationKey) {
    super(message ?? "catalog.categories.errors.already_exists");
  }
}
