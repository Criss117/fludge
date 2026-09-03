import { NotFoundError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class ProductPresentationNotFoundException extends NotFoundError {
  constructor(message?: TranslationKey) {
    super(message ?? "catalog.products_presentations.errors.not_found");
  }
}
