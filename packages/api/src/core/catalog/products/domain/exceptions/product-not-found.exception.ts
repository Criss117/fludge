import { NotFoundError } from "@fludge/api/core/shared/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class ProductNotFoundException extends NotFoundError {
  constructor(message?: TranslationKey) {
    super(message ?? "api_errors.catalog.products.not_found");
  }
}
