import { BadRequestError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { TranslationKey } from "@fludge/i18n/index";

export class MinStockMustBeLowerThanStockException extends BadRequestError {
  constructor(message?: TranslationKey) {
    super(
      message ?? "api_errors.catalog.products.min_stock_must_be_lower_than_stock",
    );
  }
}
