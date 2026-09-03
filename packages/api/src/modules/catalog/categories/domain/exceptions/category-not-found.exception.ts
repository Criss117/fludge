import { NotFoundError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class CategoryNotFoundException extends NotFoundError {
  constructor(message?: TranslationKey) {
    super(message ?? "catalog.categories.errors.not_found");
  }
}
