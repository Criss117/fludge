import { NotFoundError } from "@fludge/api/core/shared/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class CategoryNotFoundException extends NotFoundError {
  constructor(message?: TranslationKey) {
    super(message ?? "api_errors.catalog.categories.not_found");
  }
}
