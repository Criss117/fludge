import { BadRequestError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class InsufficientStockException extends BadRequestError {
  constructor(message?: TranslationKey) {
    super(message ?? "api_errors.catalog.products.insufficient_stock");
  }
}
